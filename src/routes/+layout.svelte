<script lang="ts">
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/sidebar.svelte';
	import type { Information } from 'src/app';
	import Header from './Header.svelte';
	import './styles.css';
	/** @type {import('./$types').PageData} */
	export let data: Information;

	/** @type {import('./$types').ActionData} */
	export let form: any;
</script>

<div class="app">
	<Header />
	{#if $page.url.pathname != '/login'}
		<Sidebar databases={data.databases} {form} type={data.type}/>
	{/if}
	<main>
		<slot />
	</main>
</div>

<style>
</style>
