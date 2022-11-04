<script lang="ts">
	 export let records: Table;
</script>

<div class="table_container">
    <div class="code_container">
        <p class="code_text">{records.query}</p>
    </div>
	<table class="table">
		<thead>
			<tr>
				{#each records.cols as col}
					<th scope="col">{col}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each records.records as record, i}
				<tr>
					{#each Object.values(record) as value}
						<td>{value}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table_container {
		padding-left: 20em;
		margin-top: 4em;
	}
    .code_container{
        background-color: #858de5;
        color: white;
    }
    .code_text{
        font-size: 1.5em;
    }
</style>
