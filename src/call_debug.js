
const url = "http://127.0.0.1:54321/rest/v1";
const key = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

async function run() {
    console.log("Calling debug_dashboard_visibility...");
    try {
        const response = await fetch(`${url}/rpc/debug_dashboard_visibility`, {
            method: 'POST',
            headers: {
                "apikey": key,
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            console.error("Error:", response.status, response.statusText);
            console.log(await response.text());
        } else {
            const text = await response.json(); // It returns basic JSON since it's an RPC returning text
            console.log("\nREPORT OUTPUT:\n");
            console.log(text);
        }
    } catch (e) {
        console.error(e);
    }
}

run();
