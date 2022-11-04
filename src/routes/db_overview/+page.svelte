<script lang="ts">
	import Records from '$lib/components/records.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';
	import Struct from '$lib/components/struct.svelte';
	import { onMount } from 'svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	/** @type {import('./$types').PageForm} */
	export let form;

	let databases: Array<string> = [], show_records: boolean = false, selected = "", struct = false;

	onMount(() => {
		databases = JSON.parse(localStorage.getItem("dbs"));
		if(form != null){
			if(form.type == "records"){
				show_records = true;
			}else{
				struct = true;
			}		
		}
	})
</script>

<Sidebar databases={databases} form={data.db}></Sidebar>

{#if !show_records && !struct}
<!--Main layout-->
<main>
	<div class="container pt-4 table_container">
		<div class="container text-center details">
		<table class="table table-striped table-hover">
			<thead>
			  <tr>
				<th scope="col">Table</th>
				<th scope="col">Action</th>
				<!-- <th scope="col">Last</th>
				<th scope="col">Handle</th> -->
			  </tr>
			</thead>
			<tbody>
				{#each data.tables as table}
			  <tr>
				<th scope="row">{table}</th>
				<th>
					<form method="POST" action="?/records">
						<button class="btn btn-primary" value={table} name="table">View records</button>	
						<input type="hidden" value={data.db} name="db"/>
					</form>
				</th>
				<th>
					<form method="POST" action="?/struct">
						<button class="btn btn-primary" value={table} name="table">View structure</button>	
						<input type="hidden" value={data.db} name="db"/>
					</form>
				</th>
			  </tr>
			  {/each}
			</tbody>
		  </table>
		</div>
	</div>
</main>
{:else if show_records}
	<Records records={form}></Records>
{:else if struct}
	<Struct structure={form}></Struct>
{/if}
<style>
	.table_container{
		padding-left: 12em;
		margin-top: 4em;
	}
</style>