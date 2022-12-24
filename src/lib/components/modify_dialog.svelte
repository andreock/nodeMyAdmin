<script lang="ts">
	import { DialogContent, dialogs, getClose } from 'svelte-dialogs';
	export let records: Array<object>,
		db: string,
		table: string,
		index: number,
		cols,
		old_db: Array<object>;

	function update() {
		let records_new = structuredClone(records); // Need because if we update records, we will update also old_db and this broke WHERE clause

		Object.keys(records_new[index]).forEach((key, i) => {
			const input = document.getElementById('update' + i);
			if (input instanceof HTMLInputElement) records_new[index][key] = input.value;
		});

		var myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
		var urlencoded = new URLSearchParams();
		urlencoded.append('values', JSON.stringify(records_new[index]));
		urlencoded.append('db', db);
		urlencoded.append('table', table);
		urlencoded.append('old_db', JSON.stringify(old_db[index]));
		urlencoded.append('index', index.toString());

		var requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: urlencoded,
			redirect: 'follow'
		};

		fetch('?/update', requestOptions)
			.then((response) => response.json())
			.then(async (result) => {
				if (result.data.success) {
					dialogs.alert('Row updated successfully').then(() => location.reload());
				} else {
					dialogs.alert('Error during updating row, error: ' + result.error_message);
				}
			});
	}
</script>

<DialogContent>
	<svelte:fragment slot="body">
		{#each Object.values(records[index]) as value, i}
			{#if new Date(value) == 'Invalid Date' || value == '1' || value == '0'}
				<label for="exampleInputEmail1" class="form-label">{cols[i]}</label>
				<input
					type="text"
					class="form-control"
					id={'update' + i}
					aria-describedby="emailHelp"
					{value}
				/>
				<br />
			{:else if typeof value == 'number'}
				<label for="exampleInputEmail1" class="form-label">{cols[i]}</label>
				<input
					type="number"
					class="form-control"
					id={'update' + i}
					aria-describedby="emailHelp"
					{value}
				/>
				<br />
			{:else}
				<label for="exampleInputEmail1" class="form-label">{cols[i]}</label>
				<input
					type="date"
					class="form-control"
					id={'update' + i}
					aria-describedby="emailHelp"
					value={new Date(value).toISOString().slice(0, 10)}
				/>
				<br />
			{/if}
		{/each}
		<button class="btn btn-warning" on:click={update}>Modify record</button>
		<br />
		<br />
		<button type="button" class="btn btn-danger" on:click={getClose}>Close</button>
	</svelte:fragment>
</DialogContent>
