<script lang="ts">
	import Sidebar from '$lib/components/sidebar.svelte';
	import Header from './Header.svelte';
	import './styles.css';
	/** @type {import('./$types').PageData} */
	export let data: Information;

	/** @type {import('./$types').ActionData} */
	export let form: any;
</script>

<div class="app">
	<Header />
	<Sidebar databases={data.databases} {form} />

	<main>
		<slot />
	</main>
</div>

<style>
</style>
