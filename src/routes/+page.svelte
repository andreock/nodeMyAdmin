<script lang="ts">
	import type { Information } from 'src/app';
	import { onMount } from 'svelte';

	const version = '1.4';	// Version of nodeMyAdmin

	/** @type {import('./$types').PageData} */
	export let data: Information;

	/** @type {import('./$types').ActionData} */
	export let form: any;

	onMount(() => {
		localStorage.setItem('dbs', JSON.stringify(data.databases));
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<!--Main layout-->
<main>
	<div class="container pt-4 details">
		<div class="container text-center details">
			<div class="row">
				<div class="col">
					<table class="table table-striped table-primary">
						<thead>
							<tr>
								<th scope="col">Database information</th>
								<th />
							</tr>
						</thead>
						<tbody>
							<tr>
								<th scope="row">DB Engine: {data.db.type}</th>
								<th />
							</tr>
							<tr>
								<th scope="row">Engine version: {data.db?.version}</th>
								<th />
							</tr>
							{#if data.db.type != "SQLite"}
								<tr>
									<th scope="row">IP: {data.db.ip}</th>
									<th />
								</tr>
							{:else}
								<tr>
									<th scope="row">Path: {data.db.ip}</th>
									<th />
								</tr>
							{/if}
							{#if data.db.type != "SQLite"}
								<tr>
									<th scope="row">User: {data.db.user}</th>
									<th />
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
				<div class="col">
					<table class="table table-striped table-primary">
						<thead>
							<tr>
								<th scope="col">Web server information</th>
								<th />
							</tr>
						</thead>
						<tbody>
							<tr>
								<th scope="row">NodeMyAdmin {version}</th>
								<th />
							</tr>
							<tr>
								<th scope="row">Node {data.version}</th>
								<th />
							</tr>
							<tr>
								<th scope="row">OS: {data.os}</th>
								<td colspan="1" />
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	.details {
		margin-top: 2em;
		padding-left: 6em;
	}
</style>
