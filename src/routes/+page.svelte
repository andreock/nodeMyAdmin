<script lang="ts">
	import Fa from 'svelte-fa/src/fa.svelte'
	import { faDatabase } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';

	const version = 0.1;

	/** @type {import('./$types').PageData} */
	export let data;

	/** @type {import('./$types').ActionData} */
	export let form;

	onMount(() => document.getElementById(form)?.classList.add("active"));
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<header>
	<!-- Sidebar -->
	<nav id="sidebarMenu" class="collapse d-lg-block sidebar collapse bg-white">
		<div class="position-sticky">
			<div class="list-group list-group-flush mx-3 mt-4">
				{#each data.databases as database}
				<form method="POST" action="?/db">
					<button class="list-group-item list-group-item-action py-2 ripple" id={database}>
						<Fa icon={faDatabase} /><span class="dbname">{database}</span>
					</button>
					<input type="hidden" value={database} name="db"/>
				</form>
				{/each}
			</div>
		</div>
	</nav>
	<!-- Sidebar -->
</header>

<!--Main layout-->
<main>
	<div class="container pt-4">
		<div class="container text-center details">
			<div class="row">
				<div class="col">
					<table class="table table-striped table-primary">
						<thead>
							<tr>
								<th scope="col">Database</th>
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
							<tr>
								<th scope="row">IP: {data.db.ip}</th>
								<th />
							</tr>
							<tr>
								<th scope="row">User: {data.db.user}</th>
								<th />
							</tr>
						</tbody>
					</table>
				</div>
				<div class="col">
					<table class="table table-striped table-primary">
						<thead>
							<tr>
								<th scope="col">Web server</th>
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

<!--Main layout-->
<style>
	@import 'bootstrap/dist/css/bootstrap.min.css';
	.details {
		margin-top: 100px;
	}
	.dbname{
		padding-left: 5px;
	}
	@media (min-width: 991.98px) {
		main {
			padding-left: 240px;
		}
	}

	/* Sidebar */
	.sidebar {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		padding: 58px 0 0; /* Height of navbar */
		box-shadow: 0 2px 5px 0 rgb(0 0 0 / 5%), 0 2px 10px 0 rgb(0 0 0 / 5%);
		width: 240px;
		z-index: 600;
	}

	@media (max-width: 991.98px) {
		.sidebar {
			width: 100%;
		}
	}
</style>
