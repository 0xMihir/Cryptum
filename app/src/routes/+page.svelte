<script lang="ts">
	import { onMount } from 'svelte';
	import Login from '../lib/Login.svelte';
	import "@fontsource/roboto";
	import "@fontsource/varela-round";
</script>
<video id="background-video"
	src="/videos/landing-page-bg.mp4"
	autoplay muted
	>
	<track kind="captions">
</video>

<div class="center">
	<div class="items">
		<div class="title-container">
			<img class="logo" src="/logo.png" alt="logo"/>
			<h1>Cryptum</h1>
		</div>

		<h2>Encrypted file storage powered by the Tillitis TKey</h2>

		<Login />
	</div>
</div>


<style>
	.title-container {
		display: flex;
		text-align: center;
		align-items: center;
		justify-content: center;
	}
	.logo {
		display: inline-block;
	}
	h1 {
		font-size: 70px;
		font-family: 'Varela Round';
		font-weight: 200;
		background: white;
		color: transparent;
		background-clip: text;
		-webkit-background-clip: text;
		display: inline-block;
	}
	h2 {
		font-size: 25px;

		font-weight: 200;
		font-family: 'Varela Round';
		background-image: linear-gradient(to left, #FF0790, #2300FF);
		color: transparent;
		background-clip: text;
		-webkit-background-clip: text;
		display: block;
	}
	.center {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 50vh;
	}
	.items {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

		#background-video {
		width: 100vw;
		height: 100vh;
		object-fit: cover;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: -1;
		position: fixed;
		}
</style>
