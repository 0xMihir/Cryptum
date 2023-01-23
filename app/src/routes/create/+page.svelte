<script>
	import CreateUser from '$lib/CreateUser.svelte';
	import '@fontsource/varela-round';
</script>

<body>
	<div class="container">
		<div class="centerbox">
			<h1 class="top-text">Looks like you don't have an account yet</h1>
			<h2 class="bottom-text">Please choose a username</h2>
			<CreateUser />
		</div>
	</div>
</body>

<svelte:head>
	<style>
		body {
			background: radial-gradient(circle closest-corner, #0c005c, #600035);
		}
	</style>
</svelte:head>

<style>
	.container {
		top: 20px;
		position: relative;
		width: 350px;
		height: 500px;
		border-radius: 10px;
		padding: 40px;
		box-sizing: border-box;
		background: rgba(18, 18, 18, 0.65);
		align-content: center;
	}
	.centerbox {
		margin-top: 10px;
		font-weight: 400;
		font-size: 1.1rem;
		color: white;
		letter-spacing: 1px;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
	.top-text {
		text-align: center;
		color: rgb(218, 218, 218);
		opacity: 1;
		font-family: 'Varela Round';
	}
	.bottom-text {
		text-align: center;
		color: rgb(168, 163, 163);
		opacity: 1;
		font-family: 'Varela Round';
	}
</style>
