<script lang="ts">
	function logout() {
		const form = document.getElementById('logout');
		if (form instanceof HTMLFormElement) form.submit();
	}
</script>

<header>
	<nav id="main-navbar" class="navbar navbar-expand-lg fixed-top navbar-dark bg-dark">
		<div class="container-fluid">
			<a class="navbar-brand" href="/">NodeMyAdmin</a>
			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarSupportedContent"
				aria-controls="navbarSupportedContent"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon" />
			</button>
			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<ul class="navbar-nav me-auto mb-2 mb-lg-0">
					<li class="nav-item">
						<a class="nav-link active" aria-current="page" href="#">Home</a>
					</li>
					<li class="nav-item">
						<form method="POST" action="/?/logout" id="logout">
							<a class="nav-link active" aria-current="page" href="#0" on:click={logout}>Logout</a>
						</form>
					</li>
				</ul>
			</div>
		</div>
	</nav>
</header>

<style>
	@import 'bootstrap/dist/css/bootstrap.min.css';
</style>
