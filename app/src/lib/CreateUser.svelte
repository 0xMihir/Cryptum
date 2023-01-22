<script lang='ts'>
	import { goto } from "$app/navigation";
	import { error, redirect } from "@sveltejs/kit";

    let username = '';
    // const pubKey:any = getCookie('pubKey'); //pubkey
    const pubKey = 'cygnusx26';
    //validate the public key somehow

    if (!pubKey) {
        error(500, 'No valid public key found');
    }
    const createUser = () =>
        fetch('/api/insertuser', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, pubKey }),
        })
        .then((res) => res.json())
        .then(async (data) => {
            if (data.success) {
                setCookie('username', username);
                goto('/drive'); //TODO: add user param
            } else {
                error(500, 'User creation failed');
            }
        })
        .catch((err) => {
            console.log(err);
        });

    function setCookie(name: string, val: string) {
		const date = new Date();
		const value = val;

		// Set it expire in 7 days
		date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));

		// Set it
		document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path=/";
	}
</script>
<body class='create-page-bg'>
    <input type="text" bind:value={username} />
    <button on:click={createUser}>Create User</button>
</body>

<svelte:head>
  <style>
    .create-page-bg {
        background: linear-gradient(-45deg, #2300FF, #000, #FF0790);
        background-size: 400% 400%;
        animation: gradient 7s ease infinite;
    }
  </style>
</svelte:head>

<style>

@keyframes gradient {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}
</style>
