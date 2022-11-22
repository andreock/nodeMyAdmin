<script lang="ts">
	import type { Insert } from 'src/app';
	import { onMount } from 'svelte';
	let rows: Array<Insert> = [];
	onMount(() => {
		const rows_raw = localStorage.getItem('rows');
		if (rows_raw != null) rows = JSON.parse(rows_raw);
	});
</script>

<div class="table_container">
	<table class="table">
		<thead>
			<tr>
				{#each rows as x, i}
					{#each Object.keys(rows[i]) as col}
						<th scope="col">{col}</th>
					{/each}
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as record, i}
				<tr>
					{#each Object.values(record) as value}
						<td>{value}</td>
					{/each}
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
</style>
