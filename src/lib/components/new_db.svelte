<script lang="ts">
	import { DialogContent, dialogs, getClose } from 'svelte-dialogs';
</script>

<DialogContent>
	<svelte:fragment slot="body">
		<form method="POST" action="?/create">
			<div class="mb-3">
				<label for="exampleInputEmail1" class="form-label">Database name</label>
				<input type="text" class="form-control" id="db" name="db" aria-describedby="emailHelp" />
			</div>
			<button class="btn btn-success">Create new database</button>
		</form>
		<br />
		<br />
	</svelte:fragment>
</DialogContent>
