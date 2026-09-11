<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	type Row = {
		key: string;
		id?: string;
		label: string;
		fieldType: 'short' | 'long' | 'date';
		section: 'left' | 'right';
		required: boolean;
	};

	let { data, form }: PageProps = $props();

	function seed(): Row[] {
		const qs = data.locked ? [] : data.questions;
		return qs.map((q) => ({ ...q, key: crypto.randomUUID() }));
	}

	let items = $state<Row[]>(untrack(seed));
	let saving = $state(false);
	let applyId = $state('');
	let confirmApply = $state(false);

	const templateList = $derived(data.locked ? [] : data.templates);
	const previewTemplate = $derived(templateList.find((t) => t.id === applyId));
	const message = $derived(form && 'message' in form ? form.message : undefined);
	const saved = $derived(Boolean(form && 'saved' in form && form.saved));

	function add() {
		items = [
			...items,
			{ key: crypto.randomUUID(), label: '', fieldType: 'long', section: 'left', required: false }
		];
	}
	function removeAt(i: number) {
		items = items.filter((_, k) => k !== i);
	}
	function move(i: number, dir: -1 | 1) {
		const j = i + dir;
		if (j < 0 || j >= items.length) return;
		const next = [...items];
		[next[i], next[j]] = [next[j], next[i]];
		items = next;
	}

	const payload = $derived(
		JSON.stringify(
			items.map((r) => ({
				...(r.id ? { id: r.id } : {}),
				label: r.label.trim(),
				fieldType: r.fieldType,
				section: r.section,
				required: r.required
			}))
		)
	);
	const canSave = $derived(items.length > 0 && items.every((r) => r.label.trim().length > 0));
</script>

<svelte:head><title>Fragen bearbeiten</title></svelte:head>

{#if !data.locked}
	<div class="wrap">
		{#if saved}<p class="flash">Gespeichert.</p>{/if}
		{#if message}<p class="flash flash--err">{message}</p>{/if}

		<p class="note">
			Diese Fragen erscheinen auf jeder Eintragsseite. <strong
				>Eine Frage zu entfernen löscht auch die bereits gegebenen Antworten</strong
			> darauf.
		</p>

		<form
			method="POST"
			action="?/save"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update({ reset: false });
					saving = false;
					items = seed();
				};
			}}
		>
			<input type="hidden" name="questions" value={payload} />

			<ol class="rows">
				{#each items as row, i (row.key)}
					<li class="row">
						<div class="row__order">
							<button
								type="button"
								class="mini"
								onclick={() => move(i, -1)}
								disabled={i === 0}
								aria-label="nach oben">▲</button
							>
							<button
								type="button"
								class="mini"
								onclick={() => move(i, 1)}
								disabled={i === items.length - 1}
								aria-label="nach unten">▼</button
							>
						</div>
						<div class="row__fields">
							<input
								class="row__label"
								bind:value={row.label}
								maxlength="200"
								placeholder="Frage …"
								aria-label="Fragetext"
							/>
							<div class="row__meta">
								<select bind:value={row.fieldType} aria-label="Feldtyp">
									<option value="short">kurz</option>
									<option value="long">lang</option>
									<option value="date">Datum</option>
								</select>
								<select bind:value={row.section} aria-label="Seite">
									<option value="left">linke Seite</option>
									<option value="right">rechte Seite</option>
								</select>
								<label class="req">
									<input type="checkbox" bind:checked={row.required} />
									Pflicht
								</label>
								<button type="button" class="row__del" onclick={() => removeAt(i)}>
									Entfernen
								</button>
							</div>
						</div>
					</li>
				{/each}
			</ol>

			<div class="actions">
				<button type="button" class="btn" onclick={add}>+ Frage hinzufügen</button>
				<button type="submit" class="btn btn--primary" disabled={!canSave || saving}>
					{saving ? 'Speichern …' : 'Fragen speichern'}
				</button>
			</div>
		</form>

		<hr />

		<section class="tpl">
			<h2>Vorlage anwenden</h2>
			<p class="note">
				Ersetzt <strong>alle</strong> Fragen durch die der Vorlage. Antworten gehen verloren.
			</p>
			<form
				method="POST"
				action="?/applyTemplate"
				use:enhance={() => {
					return async ({ update }) => {
						confirmApply = false;
						await update({ reset: false });
						items = seed();
					};
				}}
			>
				<select name="templateId" bind:value={applyId} aria-label="Vorlage">
					<option value="" disabled>Vorlage wählen …</option>
					{#each templateList as t (t.id)}
						<option value={t.id}>{t.name}</option>
					{/each}
				</select>
				{#if confirmApply}
					<button type="submit" class="btn btn--danger" disabled={!applyId}> Ja, ersetzen </button>
					<button type="button" class="btn" onclick={() => (confirmApply = false)}>Abbrechen</button
					>
				{:else}
					<button
						type="button"
						class="btn"
						disabled={!applyId}
						onclick={() => (confirmApply = true)}
					>
						Anwenden
					</button>
				{/if}
			</form>

			{#if previewTemplate}
				<ul class="tpl__preview">
					{#each previewTemplate.questions as q (q.label)}
						<li>{q.label}</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
{/if}

<style>
	.wrap {
		display: flex;
		flex-direction: column;
	}
	.note {
		font-size: var(--step--1);
		color: var(--ink-500);
		max-width: 44rem;
	}
	.flash {
		background: color-mix(in srgb, var(--ok) 14%, var(--surface));
		border: 1px solid color-mix(in srgb, var(--ok) 40%, var(--surface-line));
		border-radius: 6px;
		padding: 0.5rem 0.8rem;
		font-size: var(--step--1);
		margin: 0 0 1rem;
	}
	.flash--err {
		background: color-mix(in srgb, var(--danger) 12%, var(--surface));
		border-color: color-mix(in srgb, var(--danger) 40%, var(--surface-line));
		color: var(--danger);
	}

	.rows {
		list-style: none;
		margin: 1rem 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.row {
		display: flex;
		gap: 0.7rem;
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 8px;
		padding: 0.7rem 0.9rem;
	}
	.row__order {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.mini {
		width: 1.5rem;
		height: 1.2rem;
		font-size: 0.6rem;
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		border-radius: 3px;
		cursor: pointer;
		color: var(--ink-500);
	}
	.mini:disabled {
		opacity: 0.3;
	}
	.row__fields {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
	}
	.row__label {
		width: 100%;
		border: 0;
		border-bottom: 1.5px solid var(--paper-line);
		background: transparent;
		font-size: var(--step-0);
		padding: 0.2rem 0;
	}
	.row__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--step--1);
	}
	select {
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		border-radius: 5px;
		padding: 0.25rem 0.4rem;
		font: inherit;
		font-size: var(--step--1);
	}
	.req {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		color: var(--ink-500);
	}
	.row__del {
		margin-left: auto;
		background: none;
		border: 0;
		color: var(--danger);
		cursor: pointer;
		font-size: var(--step--1);
	}

	.actions {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
		margin-top: 0.5rem;
	}
	.btn {
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.03em;
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		color: var(--ink-700);
		border-radius: 999px;
		padding: 0.45rem 1rem;
		cursor: pointer;
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.btn--primary {
		background: var(--oxblood);
		color: var(--paper-100);
		border-color: var(--oxblood);
	}
	.btn--danger {
		color: var(--danger);
		border-color: color-mix(in srgb, var(--danger) 40%, var(--surface-line));
	}

	hr {
		border: 0;
		border-top: 1px solid var(--surface-line);
		margin: 2rem 0;
	}
	.tpl h2 {
		font-family: var(--font-label);
		font-size: var(--step-0);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.4rem;
	}
	.tpl form {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
		align-items: center;
		margin-top: 0.7rem;
	}
	.tpl__preview {
		margin: 0.8rem 0 0;
		padding: 0.6rem 0 0 1.1rem;
		border-top: 1px dashed var(--surface-line);
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: var(--step--1);
		color: var(--ink-700);
		max-width: 32rem;
	}
</style>
