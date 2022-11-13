<script>
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faDatabase, faPlus } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import { dialogs } from 'svelte-dialogs';
	import NewDb from './new_db.svelte';

	export let databases, form;

	onMount(() => document.getElementById(form)?.classList.add('active'));
</script>

<header>
	<!-- Sidebar -->
	<nav id="sidebarMenu" class="collapse d-lg-block sidebar collapse bg-white">
		<div class="position-sticky">
			<div class="list-group list-group-flush mx-3 mt-4">
				<button
					class="list-group-item list-group-item-action py-2 ripple"
					on:click={() => dialogs.modal(NewDb)}
				>
					<Fa icon={faPlus} /><span class="dbname">New database</span>
				</button>
				{#each databases as database}
					<form method="POST" action="/?/db">
						<button class="list-group-item list-group-item-action py-2 ripple" id={database}>
							<Fa icon={faDatabase} /><span class="dbname">{database}</span>
						</button>
						<input type="hidden" value={database} name="db" />
					</form>
				{/each}
			</div>
		</div>
	</nav>
	<!-- Sidebar -->
</header>

<!--Main layout-->
<style>
	@import 'bootstrap/dist/css/bootstrap.min.css';
	.details {
		margin-top: 100px;
	}
	.dbname {
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
