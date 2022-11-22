<script lang="ts">
	import Records from '$lib/components/records.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';
	import Struct from '$lib/components/struct.svelte';
	import Add from '$lib/components/add.svelte';
	import type { db_overview_form, db_overview_load } from 'src/app';
	import { onMount } from 'svelte';
	import { dialogs } from 'svelte-dialogs';
	import Search from '$lib/components/search.svelte';
	import NewTable from '$lib/components/new_table.svelte';

	/** @type {import('./$types').PageData} */
	export let data: db_overview_load;

	/** @type {import('./$types').PageForm} */
	export let form: db_overview_form;

	let databases: Array<string> = [],
		show_records = false,
		selected = '',
		struct = false,
		delete_records = false;

	onMount(() => {
		const storage = localStorage.getItem('dbs');
		if (storage != null) databases = JSON.parse(storage);

		if (form != null) {
			if (form.type == 'records') {
				show_records = true;
			} else if (form.type == 'struct') {
				struct = true;
			} else {
				delete_records = true;
			}
			selected = form.selected;
			if (form.success) {
				dialogs.alert('Query executed successfully').then(() => (location.href = '/'));
			} else if (form.success != null) {
				dialogs.alert('Error during the deletion of a column. Error: ' + form.error);
			}
		}
	});
	function confirm_action(type: number, table: string) {
		if (type == 0) {
			dialogs.confirm('Are you sure to TRUNCATE ' + table + '?').then((response) => {
				if (response) {
					const form = document.getElementById('truncate-' + table);
					if (form instanceof HTMLFormElement) form.submit();
				}
			});
		} else {
			dialogs.confirm('Are you sure to DROP ' + table + '?').then((response) => {
				if (response) {
					const form = document.getElementById('drop-' + table);
					if (form instanceof HTMLFormElement) form.submit();
				}
			});
		}
	}
</script>

{#if !show_records && !struct && !delete_records}
	<!--Main layout-->
	<main>
		<div class="container pt-4 table_container">
			<div class="container text-center details">
				<button class="btn btn-primary" on:click={() => dialogs.modal(NewTable, { db: data.db })}>
					Add table
				</button>
				<table class="table table-striped table-hover">
					<thead>
						<tr>
							<th scope="col">Table</th>
							<th scope="col">Action</th>
						</tr>
					</thead>
					<tbody>
						{#each data.tables as table}
							<tr>
								<th scope="row">{table}</th>
								<th>
									<form method="POST" action="?/records">
										<button class="btn btn-primary" value={table} name="table">View records</button>
										<input type="hidden" value={data.db} name="db" />
									</form>
								</th>
								<th>
									<form method="POST" action="?/struct">
										<button class="btn btn-secondary" value={table} name="table"
											>View structure</button
										>
										<input type="hidden" value={data.db} name="db" />
									</form>
								</th>
								<th>
									<button
										class="btn btn-success"
										on:click={() => dialogs.modal(Add, { table: table, db: data.db })}
										>Add record</button
									>
								</th>
								<th>
									<button
										class="btn btn-info"
										on:click={() => dialogs.modal(Search, { table: table, db: data.db })}
										>Search in table</button
									>
								</th>
								<th>
									<form method="POST" action="?/truncate" id={'truncate-' + table}>
										<button
											class="btn btn-warning"
											type="button"
											on:click={() => confirm_action(0, table)}>Truncate table</button
										>
										<input type="hidden" value={table} name="table" />
										<input type="hidden" value={data.db} name="db" />
									</form>
								</th>
								<th>
									<form method="POST" action="?/drop" id={'drop-' + table}>
										<button
											class="btn btn-danger"
											type="button"
											on:click={() => confirm_action(1, table)}>Drop table</button
										>
										<input type="hidden" value={table} name="table" />
										<input type="hidden" value={data.db} name="db" />
									</form>
								</th>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</main>
{:else if show_records && !delete_records}
	<Records records={form} table={selected} db={data.db} />
{:else if struct && !delete_records}
	<Struct structure={form} table={selected} />
{:else}
	<p>Delete record</p>
{/if}

<style>
	.table_container {
		padding-left: 12em;
		margin-top: 4em;
	}
</style>
