<script lang="ts">
	import { onMount } from 'svelte';
	import Login from '../lib/Login.svelte';
	import "@fontsource/roboto";
</script>
<video id="background-video"
	src="../static/videos/landing-page-bg.mp4"
	autoplay muted
	>
	<track kind="captions">
</video>
<h1>Cryptum</h1>

<h2>Encrypted file storage powered by the Tillitis TKey</h2>

<div class="login-button">
	<Login />
</div>


<style>
	h1 {
		font-size: 70px;
		font-family: 'Roboto', sans-serif;
		font-weight: 200;
		background: white;
		color: transparent;
		background-clip: text;
		-webkit-background-clip: text;
		display: block;
	}
	h2 {
		font-size: 25px;
		font-weight: 200;
		font-family: 'Roboto', sans-serif;
		background-image: linear-gradient(to left, #FF0790, #2300FF);
		color: transparent;
		background-clip: text;
		-webkit-background-clip: text;
		display: block;
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
