<script>
	import { onMount } from 'svelte';

	onMount(() => {
		const header = document.getElementsByTagName('header');
		header[0].style.display = 'none';
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
					placeholder="Ip of DB server"
					name="ip"
				/>
			</div>
			<div class="mb-3">
				<label for="exampleInputPassword1" class="form-label">Type of server</label>
				<select class="form-select" name="type">
					<option selected>MySQL</option>
					<option>MSSQL</option>
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
	@media only screen and (min-width: 1920px){
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
