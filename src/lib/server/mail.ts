import { createTransport, type Transporter } from 'nodemailer';
import { MAIL_ENABLED, MAIL_FROM, SMTP_URL } from './env';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
	if (!MAIL_ENABLED || !SMTP_URL) return null;
	if (!transporter) transporter = createTransport(SMTP_URL);
	return transporter;
}

/**
 * Verschickt eine einfache Text-Mail über den konfigurierten SMTP-Server
 * (beliebiger Anbieter – eigener Postfix, Brevo/Mailjet/Postmark per SMTP, …).
 * Ist kein SMTP_URL gesetzt, wird nichts verschickt (`false`), ohne zu werfen –
 * Aufrufer entscheiden selbst, ob/wie sie das dem Nutzer mitteilen.
 */
export async function sendMail(opts: {
	to: string;
	subject: string;
	text: string;
}): Promise<boolean> {
	const t = getTransporter();
	if (!t) return false;
	await t.sendMail({ from: MAIL_FROM, to: opts.to, subject: opts.subject, text: opts.text });
	return true;
}
