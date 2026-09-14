import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { bookAccess, invite } from '$lib/server/db/schema';
import { loadBookAccess, requireAdmin } from '$lib/server/guard';
import { hashPassword, hashToken, newToken } from '$lib/server/crypto';
import { logAudit } from '$lib/server/audit';
import { ORIGIN } from '$lib/server/env';
import type { Actions, PageServerLoad } from './$types';

async function adminBook(params: { token: string }, cookies: import('@sveltejs/kit').Cookies) {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) return null;
	requireAdmin(access);
	return access.book;
}

const viewPath: Record<string, string> = { admin: 'admin', read: 'lesen', write: 'schreiben' };

export const load: PageServerLoad = async ({ params, cookies }) => {
	const b = await adminBook(params, cookies);
	if (!b) return { locked: true as const };

	const [accessRows, openInvite, personalInvites] = await Promise.all([
		db.query.bookAccess.findMany({ where: eq(bookAccess.bookId, b.id) }),
		db.query.invite.findFirst({ where: and(eq(invite.bookId, b.id), eq(invite.kind, 'open')) }),
		db.query.invite.findMany({
			where: and(eq(invite.bookId, b.id), eq(invite.kind, 'personal')),
			orderBy: asc(invite.createdAt)
		})
	]);

	const hasPw = (role: 'admin' | 'read') =>
		accessRows.find((r) => r.role === role)?.passwordHash !== null;

	return {
		locked: false as const,
		adminLink: `${ORIGIN}/b/${params.token}/admin`,
		passwords: {
			admin: hasPw('admin'),
			read: hasPw('read'),
			write: openInvite?.passwordHash != null
		},
		openWriteId: openInvite?.id ?? null,
		invites: personalInvites.map((i) => ({
			id: i.id,
			label: i.label ?? 'Einladung',
			prefillName: i.prefillName ?? '',
			usedCount: i.usedCount,
			maxEntries: i.maxEntries,
			revoked: i.revokedAt !== null
		}))
	};
};

export const actions: Actions = {
	setPassword: async ({ request, params, cookies }) => {
		const b = await adminBook(params, cookies);
		if (!b) return fail(403, { message: 'Kein Zugriff.' });

		const fd = await request.formData();
		const role = String(fd.get('role') ?? '');
		const pw = String(fd.get('password') ?? '');
		if (!['admin', 'read', 'write'].includes(role)) return fail(400);
		if (pw && pw.length < 4) return fail(400, { message: 'Passwort: mindestens 4 Zeichen.' });

		const hash = pw ? await hashPassword(pw) : null;
		if (role === 'write') {
			await db
				.update(invite)
				.set({ passwordHash: hash })
				.where(and(eq(invite.bookId, b.id), eq(invite.kind, 'open')));
		} else {
			await db
				.update(bookAccess)
				.set({ passwordHash: hash })
				.where(and(eq(bookAccess.bookId, b.id), eq(bookAccess.role, role as 'admin' | 'read')));
		}

		await logAudit({
			bookId: b.id,
			actorRole: 'admin',
			action: hash ? 'access.password-set' : 'access.password-removed',
			meta: { role, bookTitle: b.title }
		});

		return { done: `passwort-${role}` };
	},

	regenerate: async ({ request, params, cookies }) => {
		const b = await adminBook(params, cookies);
		if (!b) return fail(403, { message: 'Kein Zugriff.' });

		const role = String((await request.formData()).get('role') ?? '');
		if (!['admin', 'read', 'write'].includes(role)) return fail(400);

		const token = newToken();
		if (role === 'write') {
			await db
				.update(invite)
				.set({ tokenHash: hashToken(token) })
				.where(and(eq(invite.bookId, b.id), eq(invite.kind, 'open')));
		} else {
			await db
				.update(bookAccess)
				.set({ tokenHash: hashToken(token) })
				.where(and(eq(bookAccess.bookId, b.id), eq(bookAccess.role, role as 'admin' | 'read')));
		}

		await logAudit({
			bookId: b.id,
			actorRole: 'admin',
			action: 'access.regenerate',
			meta: { role, bookTitle: b.title }
		});

		return { newLink: { role, url: `${ORIGIN}/b/${token}/${viewPath[role]}` } };
	},

	createInvite: async ({ request, params, cookies }) => {
		const b = await adminBook(params, cookies);
		if (!b) return fail(403, { message: 'Kein Zugriff.' });

		const fd = await request.formData();
		const parsed = z
			.object({
				label: z.string().trim().min(1, 'Bitte einen Namen für die Einladung angeben.').max(80),
				prefillName: z.string().trim().max(80)
			})
			.safeParse({ label: fd.get('label'), prefillName: fd.get('prefillName') ?? '' });
		if (!parsed.success) {
			return fail(400, {
				message: z.flattenError(parsed.error).fieldErrors.label?.[0] ?? 'Ungültig.'
			});
		}

		const token = newToken();
		await db.insert(invite).values({
			bookId: b.id,
			kind: 'personal',
			label: parsed.data.label,
			prefillName: parsed.data.prefillName || parsed.data.label,
			tokenHash: hashToken(token),
			maxEntries: 1
		});

		await logAudit({
			bookId: b.id,
			actorRole: 'admin',
			action: 'invite.create',
			meta: { label: parsed.data.label, bookTitle: b.title }
		});

		return {
			newLink: { role: 'invite', url: `${ORIGIN}/b/${token}/schreiben`, label: parsed.data.label }
		};
	},

	revokeInvite: async ({ request, params, cookies }) => {
		const b = await adminBook(params, cookies);
		if (!b) return fail(403, { message: 'Kein Zugriff.' });
		const id = String((await request.formData()).get('id') ?? '');
		const [revoked] = await db
			.update(invite)
			.set({ revokedAt: new Date() })
			.where(and(eq(invite.id, id), eq(invite.bookId, b.id), eq(invite.kind, 'personal')))
			.returning({ label: invite.label });

		await logAudit({
			bookId: b.id,
			actorRole: 'admin',
			action: 'invite.revoke',
			meta: { label: revoked?.label, bookTitle: b.title }
		});

		return { done: 'revoke' };
	}
};
