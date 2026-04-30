import axios from "axios";

async function findUrl(username) {
    try {
        const url = `https://www.instagram.com/${username}/`;
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
            }
        });
        
        const patterns = [
            /https:\/\/linktr\.ee\/[a-zA-Z0-9._-]+/g,
            /https:\/\/moreyournishaant\.superprofile\.bio\/[a-zA-Z0-9._-]*/g,
            /https:\/\/l\.instagram\.com\/[^"'\s]+/g
        ];
        
        for (let p of patterns) {
            const match = data.match(p);
            if (match) {
                console.log("Found:", match[0]);
                return;
            }
        }
        console.log("Not found in raw HTML");
    } catch (e) {
        console.log("Error:", e.message);
    }
}
findUrl("moreyournishaant");
