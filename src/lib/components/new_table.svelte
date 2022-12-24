<script lang="ts">
	import { DialogContent } from 'svelte-dialogs';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import { dialogs } from 'svelte-dialogs';
	import Fa from 'svelte-fa/src/fa.svelte';

	export let db: string;
	let table_name: string;

	function add_field() {
		const input = document.createElement('input');
		input.classList.add('form-control');
		const br = document.createElement('br');
		document.getElementById('body')?.appendChild(br);
		document.getElementById('body')?.appendChild(input);
	}

	function create_table() {
		const inputs = document.getElementsByClassName('form-control');
		let fields: Array<string> = [];
		Array.from(inputs).forEach((element) => {
			if (element instanceof HTMLInputElement && element.id != 'table') fields.push(element.value);
		});

		var myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
		var urlencoded = new URLSearchParams();
		urlencoded.append('db', db);
		urlencoded.append('table', table_name);
		urlencoded.append('fields', JSON.stringify(fields));

		var requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: urlencoded,
			redirect: 'follow'
		};

		fetch('?/create', requestOptions)
			.then((response) => response.json())
			.then(async (result) => {
				if (result.data.success) {
					dialogs.alert('Table created successfully').then(() => location.reload());
				} else {
					dialogs.alert('Error during creation of table, error: ' + result.error_message);
				}
			});
	}
</script>

<DialogContent>
	<h1 slot="header">Add a new table in {db}</h1>
	<svelte:fragment slot="body">
		<button class="btn btn-primary" on:click={add_field}>
			<Fa icon={faPlus} /> Add new field in table</button
		>
		<br />
		<br />
		<label for="table">Name of table</label>
		<input class="form-control x" id="table" bind:value={table_name} />
		<br />
		<div id="body">
			<br />
			<p>Write the field with this notation: Name Type</p>
			<p>For example: Address varchar(255) NOT NULL PRIMARY KEY</p>
		</div>
	</svelte:fragment>
	<svelte:fragment slot="footer">
		<button class="btn btn-primary" on:click={create_table}>Create table</button>
	</svelte:fragment>
</DialogContent>
