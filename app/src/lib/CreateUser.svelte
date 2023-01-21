<script lang='ts'>
	import { goto } from "$app/navigation";
	import { error, redirect } from "@sveltejs/kit";
    export let document: any;

    let username = '';
    const uuid:any = getCookie('uuid'); //pubkey

    //validate the uuid/public key somehow

    if (!uuid) {
        error(500, 'No valid public key found');
    }
    const createUser = () =>
        fetch('/api/insertuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, uuid }),
        })
        .then((res) => res.json())
        .then(async (data) => {
            if (data.success) {
                const name = await getname(uuid);
                setCookie('username', name);
                goto('/drive'); //TODO: add user param
            } else {
                error(500, 'User creation failed');
            }
        })
        .catch((err) => {
            console.log(err);
        });

    function getCookie(name: string) {
		const value = "; " + document.cookie;
		const parts = value.split("; " + name + "=");

		if (parts.length == 2) {
			// @ts-ignore
			return parts.pop().split(";").shift();
		}
	}
    function setCookie(name: string, val: string) {
		const date = new Date();
		const value = val;

		// Set it expire in 7 days
		date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));

		// Set it
		document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path=/";
	}
    async function getname(uuid: String) {
		const response = await fetch('/api/getname', {
			method: 'POST',
			body: JSON.stringify({ uuid }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if (response.ok) {
			const data = await response.json();
			return data;
		} else {
			console.log('error');
		}
	}
</script>

<input type="text" bind:value={username} />

<button on:click={createUser}>Create User</button>
