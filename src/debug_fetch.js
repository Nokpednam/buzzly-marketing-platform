
const url = "http://127.0.0.1:54321/rest/v1";
const key = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"; // From .env

async function query(table) {
    console.log(`\n--- Fetching ${table} ---`);
    try {
        const response = await fetch(`${url}/${table}?select=*`, {
            headers: {
                "apikey": key,
                "Authorization": `Bearer ${key}`
            }
        });

        if (!response.ok) {
            console.error(`Error ${response.status}: ${response.statusText}`);
            const txt = await response.text();
            console.error(txt);
            return;
        }

        const data = await response.json();
        console.log(`Count: ${data.length}`);
        if (data.length > 0) {
            console.log("Sample:", JSON.stringify(data.slice(0, 3), null, 2));
        } else {
            console.log("Empty response (might be RLS)");
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }
}

async function run() {
    await query("ad_insights");
    await query("ad_accounts");
    await query("workspace_api_keys");
}

run();
