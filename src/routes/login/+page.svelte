<script lang="ts">
	import type { Login_Response } from 'src/app';
	import { onMount } from 'svelte';
	import { dialogs } from 'svelte-dialogs';

	/** @type {import('./$types').PageForm} */
	export let form: Login_Response;

	onMount(() => {
		const header = document.getElementsByTagName('header');
		header[0].style.display = 'none';
		if (!form.success) dialogs.alert('Wrong login data, please try again.');
	});
</script>

<section>
	<div class="login">
		<form method="POST" action="?/login">
			<div class="mb-3">
				<label for="exampleInputEmail1" class="form-label">Server IP</label>
				<input
					type="text"
					class="form-control"
					id="exampleInputEmail1"
					aria-describedby="emailHelp"
					placeholder="Ip of DB server, es. 127.0.0.1:5432, for default port you don't need to specify it"
					name="ip"
				/>
			</div>
			<div class="mb-3">
				<label for="exampleInputPassword1" class="form-label">Type of server</label>
				<select class="form-select" name="type">
					<option selected value="MySql">MySQL / MariaDB</option>
					<option value="MSSQL">MSSQL</option>
					<option value="PostgreSQL">PostgreSQL</option>
				</select>
			</div>
			<div class="mb-3">
				<label for="exampleInputPassword1" class="form-label">User of server</label>
				<input
					type="text"
					class="form-control"
					id="exampleInputPassword1"
					placeholder="User of DB"
					value="root"
					name="user"
				/>
			</div>
			<div class="mb-3">
				<label for="exampleInputPassword1" class="form-label">Password of server</label>
				<input
					type="password"
					class="form-control"
					id="exampleInputPassword1"
					placeholder="Password of DB"
					name="pass"
				/>
			</div>
			<div class="d-flex justify-content-center">
				<button type="submit" class="btn btn-primary">Login</button>
			</div>
		</form>
	</div>
</section>

<style>
	@media only screen and (min-width: 1920px) {
		.login {
			padding: 10em 40em 10em 40em;
		}
	}
	form {
		background-color: white;
		border-radius: 8px;
		padding: 20px;
	}
</style>
