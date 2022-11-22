<script lang="ts">
	import { DialogContent, dialogs } from 'svelte-dialogs';
	import { onMount } from 'svelte';
	import type { Insert, Row } from 'src/app';

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
	function search() {
		let records: Insert = {};
		rows.forEach((row) => {
			let input = document.getElementById(row.name);
			if (input instanceof HTMLInputElement) {
				if (
					(input.type == 'text' && input.value.length != 0) ||
					(input.type == 'date' && input.value.length != 0)
				) {
					Object.assign(records, { [row.name]: input.value });
				}
				if (input.type == 'checkbox' && input.checked != null)
					Object.assign(records, { [row.name]: input.checked });
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

		fetch('?/search', requestOptions)
			.then((response) => response.json())
			.then(async (result) => {
				if (!result.data.success) {
					dialogs.alert('Error during insert: ' + result.data.error_message);
				} else {
					localStorage.setItem('rows', result.data.rows);
					location.href = '/view_search';
				}
			});
	}
</script>

<DialogContent>
	<h1 slot="header">Search in {table}</h1>
	<svelte:fragment slot="body">
		<div class="mb-3">
			{#each rows as row}
				<label for={row.name} class="form-label">{row.name + ' - Type: ' + row.type}</label>
				{#if row.type == 253 || row.type == 167}
					<!--Is a string-->
					<input type="text" id={row.name} class="form-control" />
				{:else if row.type == 12 || row.type == 61 || row.type == 7}
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
				{:else if row.type == 56 || row.type == 2}
					<input type="number" id={row.name} class="form-control" />
				{/if}
				<br />
			{/each}
		</div>
		<a href="#0" on:click={() => window.open('https://stackoverflow.com/a/64774749')}
			>Types number</a
		>
	</svelte:fragment>
	<svelte:fragment slot="footer">
		<button class="btn btn-primary" on:click={search}>Search</button>
	</svelte:fragment>
</DialogContent>
