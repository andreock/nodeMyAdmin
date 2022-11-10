<script lang="ts">
	import { DialogContent, dialogs, getClose, getOptions } from 'svelte-dialogs';
	import { onMount } from 'svelte';
	import type { Insert, Row } from 'src/app';

	const close = getClose();
	const { titleId } = getOptions();
	export let table: string, db: string;
	let rows: Array<Row> = [];

	onMount(() => {
		var myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
		var urlencoded = new URLSearchParams();
		urlencoded.append('db', db);
		urlencoded.append('table', table);

		var requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: urlencoded,
			redirect: 'follow'
		};

		fetch('?/rows', requestOptions)
			.then((response) => response.json())
			.then(async (result) => {
				rows = result.data.records;
			});
	});
	function add() {
		let records: Insert = {};
		rows.forEach((row) => {
			let input = document.getElementById(row.name);
			if (input instanceof HTMLInputElement) {
				if (input.type == 'text' || input.type == 'date')
					Object.assign(records, { [row.name]: input.value });
				if (input.type == 'checkbox') Object.assign(records, { [row.name]: input.checked });
			}
		});

		var myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
		var urlencoded = new URLSearchParams();
		urlencoded.append('db', db);
		urlencoded.append('table', table);
		urlencoded.append('records', JSON.stringify(records));

		var requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: urlencoded,
			redirect: 'follow'
		};

		fetch('?/add', requestOptions)
			.then((response) => response.json())
			.then(async (result) => {
				if (!result.data.success) {
					dialogs.alert('Error during insert: ' + result.data.error_message);
				} else {
					dialogs.alert('Insert data successfully').then(() => location.reload());
				}
			});
	}
</script>

<DialogContent>
	<h1 slot="header">Add a record in {table}</h1>
	<svelte:fragment slot="body">
		<div class="mb-3">
			{#each rows as row, i}
				<label for={row.name} class="form-label">{row.name + ' - Type: ' + row.type}</label>
				{#if row.type == 253}
					<!--Is a string-->
					<input type="text" id={row.name} class="form-control" />
				{:else if row.type == 12}
					<input type="date" id={row.name} class="form-control" />
				{:else if row.type == 1}
					<div class="form-check">
						<input class="form-check-input" type="checkbox" id={row.name} />
						<label class="form-check-label" for="flexCheckDefault"> True </label>
					</div>
					<div class="form-check">
						<input class="form-check-input" type="checkbox" id={row.name} />
						<label class="form-check-label" for="flexCheckChecked"> False </label>
					</div>
				{/if}
				<br />
			{/each}
		</div>
		<a href="#0" on:click={() => window.open('https://stackoverflow.com/a/64774749')}
			>Types number</a
		>
	</svelte:fragment>
	<svelte:fragment slot="footer">
		<button class="btn btn-primary" on:click={add}>Add record</button>
	</svelte:fragment>
</DialogContent>
