import axios from "axios";

async function testGuess(username) {
    const commonTools = [
      `https://${username}.superprofile.bio/`,
      `https://linktr.ee/${username}`
    ];
    
    for (let tool of commonTools) {
      try {
        console.log("Checking:", tool);
        const check = await axios.get(tool, { 
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36" },
          timeout: 10000 
        });
        console.log("Found!", tool, "Status:", check.status);
      } catch (e) {
        console.log("Failed:", tool, "Error:", e.message);
      }
    }
}

testGuess("moreyournishaant");
