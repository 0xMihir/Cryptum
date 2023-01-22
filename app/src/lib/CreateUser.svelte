<script lang='ts'>
	import { goto } from "$app/navigation";
	import { error, redirect } from "@sveltejs/kit";
    import {onMount } from 'svelte';

    let username = '';
    var pubKey = '';
    // const pubKey:any = getCookie('pubKey'); //pubkey
    onMount(() => {
        //@ts-ignore
        pubKey = JSON.parse(window.atob(getCookie('token').split('.')[1]))["pubKey"];
    });
    //validate the public key somehow
    if (!pubKey) {
        error(500, 'No valid public key found');
    }
    const createUser = () => {
        console.log(pubKey);
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
                setCookie('name', username);
                goto('/drive'); //TODO: add user param
            } else {
                error(500, 'User creation failed');
            }
        })
        .catch((err) => {
            console.log(err);
        });
}
    function setCookie(name: string, val: string) {
		const date = new Date();
		const value = val;

		// Set it expire in 7 days
		date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));

		// Set it
		document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path=/";
	}
    function getCookie(name: string) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
        
        if (parts.length == 2) {
            //@ts-ignore
            return parts.pop().split(";").shift();
        }
}
</script>
    <input class= "input" type="text" bind:value={username} />
<div class="create-button-container">
    <button  class='create-button' on:click={createUser}>Create User</button>
</div>


<style>
    .create-button {
        margin: 0 auto;
  color: white;
  margin-top: 20px;
  background: #1d1d1d;
  height: 40px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 300;
  transition: 0.5s;
  justify-content: center;
  align-items: center;
  font-size: medium;
  color: white;
  display:flex;
  align-items: center;
  text-align: center;
}
.create-button:hover {
  box-shadow: none;
  background-image: linear-gradient(to left, #642f4c, #372e6c);
  scale: 1.1;
}
input::placeholder {
  color: gray;
}
input:hover{
    box-shadow: none;
    scale: 1.1;
    transition: all 0.4s ease-in-out;
}
input {
    background-image: linear-gradient(to left, #642f4c, #372e6c);
  padding: 10px;
  padding-left: 20px;
  height: 50px;
  font-size: 14px;
  border-radius: 50px;
  color: #e0e0e0;
}
</style>