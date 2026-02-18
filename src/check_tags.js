
const url = "http://127.0.0.1:54321/rest/v1";
const key = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

async function checkTable(table) {
    console.log(`Checking table: ${table}`);
    try {
        const response = await fetch(`${url}/${table}?select=*&limit=1`, {
            headers: {
                "apikey": key,
                "Authorization": `Bearer ${key}`
            }
        });
        if (response.ok) {
            console.log(`✅ Table '${table}' exists.`);
        } else {
            console.log(`❌ Table '${table}' error: ${response.status} ${response.statusText}`);
            console.log(await response.text());
        }
    } catch (e) {
        console.error(`Error checking ${table}:`, e.message);
    }
}

async function run() {
    await checkTable("tags");
    await checkTable("campaign_tags");
}

run();
