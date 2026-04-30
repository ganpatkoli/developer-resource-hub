import axios from "axios";

async function testMobile(shortcode) {
    try {
        const url = `https://www.instagram.com/reel/${shortcode}/?__a=1&__d=dis`;
        const res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            }
        });
        console.log("Success!");
        console.log(JSON.stringify(res.data).substring(0, 500));
    } catch (e) {
        console.log("Error:", e.message);
    }
}

testMobile("DUSZLBBkvyv");
