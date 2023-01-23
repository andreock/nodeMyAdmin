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

		var requestOptions: RequestInit = {
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
				if (input.type == 'text' || input.type == 'date' || input.type == 'number')
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

		var requestOptions: RequestInit = {
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

	function debug_unknown_type(type: number | string) {
		console.log(
			"We don't know this type, if you see this message, please open issue on github and indicate type number, db engine and what this number should be."
		);
		console.log('DEBUG: type id ' + type);
		return ''; // We don't want to see any string in our html code
	}
</script>

<DialogContent>
	<h1 slot="header">Add a record in {table}</h1>
	<svelte:fragment slot="body">
		<div class="mb-3">
			{#each rows as row}
				<label for={row.name} class="form-label">{row.name + ' - Type: ' + row.type}</label>

				<!-- SQLite3(it return the type as string not as ID)-->
				{#if typeof row.type == 'string'}
					{#if row.type.includes('CHAR') || row.type == 'TEXT'}
						<!-- Is a SQLite string -->
						<input type="text" id={row.name} class="form-control" />
					{:else if row.type.includes('INT') || row.type == 'DECIMAL' || row.type == 'NUMERIC'}
						<!--Is a number-->
						<input type="number" id={row.name} class="form-control" />
					{:else if row.type.includes('DATE')}
						<!--Is a date-->

						<input type="date" id={row.name} class="form-control" />
					{:else if row.type == 'BOOLEAN'}
						<!--Is a boolean-->
						<div class="form-check">
							<input class="form-check-input" type="checkbox" id={row.name} />
							<label class="form-check-label" for="flexCheckDefault"> True </label>
						</div>
						<div class="form-check">
							<input class="form-check-input" type="checkbox" id={row.name} />
							<label class="form-check-label" for="flexCheckChecked"> False </label>
						</div>
					{:else}
						<!--Log unknown type to add it later-->
						{debug_unknown_type(row.type)}
						<input type="text" id={row.name} class="form-control" />
						<!-- if we don't know type, use a simple string -->
					{/if}

					<!-- MYSQL MSSQL POSTGRESQL(We have id of the type) -->
				{:else if row.type == 253 || row.type == 167 || row.type == 25}
					<!--Is a string MYSQL MSSQL POSTGRESQL-->
					<input type="text" id={row.name} class="form-control" />
				{:else if row.type == 12 || row.type == 61 || row.type == 7}
					<!--Is a date-->

					<input type="date" id={row.name} class="form-control" />
				{:else if row.type == 1}
					<!--Is a boolean-->

					<div class="form-check">
						<input class="form-check-input" type="checkbox" id={row.name} />
						<label class="form-check-label" for="flexCheckDefault"> True </label>
					</div>
					<div class="form-check">
						<input class="form-check-input" type="checkbox" id={row.name} />
						<label class="form-check-label" for="flexCheckChecked"> False </label>
					</div>
				{:else if row.type == 56 || row.type == 2 || row.type == 23}
					<!--Is a number-->
					<input type="number" id={row.name} class="form-control" />
				{:else}
					<!--Log unknown type to add it later-->
					{debug_unknown_type(row.type)}
					<input type="text" id={row.name} class="form-control" />
					<!-- if we don't know type, use a simple string -->
				{/if}

				<br />
			{/each}
		</div>
		<a href="#0" on:click={() => window.open('https://stackoverflow.com/a/64774749')}
			>Types number MySQL</a
		>
	</svelte:fragment>
	<svelte:fragment slot="footer">
		<button class="btn btn-primary" on:click={add}>Add record</button>
	</svelte:fragment>
</DialogContent>
