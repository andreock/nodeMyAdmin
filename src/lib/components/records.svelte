<script lang="ts">
	import { dialogs } from 'svelte-dialogs';
	import ModifyDialog from './modify_dialog.svelte';
	export let records: Table;
	export let table: string;
	export let db: string;
</script>

<div class="table_container">
	<div class="code_container">
		<p class="code_text">{records.query}</p>
	</div>
	<table class="table">
		<thead>
			<tr>
				{#each records.cols as col}
					<th scope="col">{col}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each records.records as record, i}
				<tr>
					{#each Object.values(record) as value}
						<td>{value}</td>
					{/each}
					<td>
						<button
							class="btn btn-warning"
							on:click={() =>
								dialogs.modal(ModifyDialog, {
									records: records.records,
									db: records.db,
									table: table,
									index: i,
									cols: records.cols,
									old_db: records.records
								})}>Modify record</button
						>
					</td>
					<td>
						<form method="POST" action="?/delete_record" id={'delete: ' + i}>
							<input type="hidden" name="table" value={table} />
							<input
								type="hidden"
								name="values"
								value={JSON.stringify(Object.values(records.records))}
							/>
							<input type="hidden" name="db" value={records.db} />
							<button class="btn btn-danger" value={i} name="index">Delete record</button>
						</form>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table_container {
		padding-left: 20em;
		margin-top: 4em;
	}
	.code_container {
		background-color: #858de5;
		color: white;
	}
	.code_text {
		font-size: 1.5em;
	}
</style>
