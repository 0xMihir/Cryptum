<script lang='ts'>
    async function doesUserExist(username: String, uuid: String) {
        const response = await fetch('/api/getusers', {
            method: 'POST',
            body: JSON.stringify({ username, uuid }),
            headers: {
                'content-type': 'application/json'
            }, 
        });

        return await response;
    }
    // pass wr_zAhUEuJ3IrtO9d8t_-A
    // user cygnusx26

    function login() {
        doesUserExist('cygnusx26', 'wr_zAhUEu').then((data) => {
            console.log(data);
        });
    }
</script>

<button on:click={login}>Login</button>