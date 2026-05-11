const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/thega/OneDrive/Desktop/GithubRepos/developer-resource-hub/client/src';

function walk(d) {
  let res = [];
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) res.push(...walk(p));
    else if (p.endsWith('.jsx')) res.push(p);
  });
  return res;
}

const files = walk(dir);

const replacements = {
  "Site_Registry": "Site Registry",
  "New_Site": "New Site",
  "All_Stations": "All Stations",
  "Access_Network": "Access Network",
  "Sites_Ctrl": "Sites Ctrl",
  "SEARCH_SITES...": "SEARCH SITES...",
  "Toolkit_Engine": "Toolkit Engine",
  "New_Toolkit": "New Toolkit",
  "Engine_Ctrl": "Engine Ctrl",
  "Research_Vault": "Research Vault",
  "New_Paper": "New Paper",
  "All_Archives": "All Archives",
  "Vault_Ctrl": "Vault Ctrl",
  "SEARCH_PAPERS...": "SEARCH PAPERS...",
  "CORE_REPOS": "CORE REPOS",
  "GOOGLE_TECH": "GOOGLE TECH",
  "GITHUB_GLOBAL": "GITHUB GLOBAL",
  "AI_ADVERSARIAL": "AI ADVERSARIAL",
  "CRYPTO_DATA": "CRYPTO DATA",
  "TECH_ROOT": "TECH ROOT",
  "TECH_INTEL": "TECH INTEL",
  "GOOGLE_HUB": "GOOGLE HUB",
  "REUTERS_INTEL": "REUTERS INTEL",
  "SYNC_INTEL": "SYNC INTEL",
  "GLOBAL_INTEL": "GLOBAL INTEL",
  "GLOBAL_GRID": "GLOBAL GRID",
  "Post_Metrics": "Post Metrics",
  "News_Hub": "News Hub",
  "Content_Manager": "Content Manager",
  "New_Content": "New Content",
  "Content_Ctrl": "Content Ctrl",
  "SEARCH_CONTENT...": "SEARCH CONTENT...",
  "Category_Vault": "Category Vault",
  "New_Category": "New Category",
  "All_Categories": "All Categories",
  "Category_Ctrl": "Category Ctrl",
  "SEARCH_CATEGORIES...": "SEARCH CATEGORIES...",
  "Admin_Dashboard": "Admin Dashboard",
  "Data_Flow": "Data Flow",
  "Admin_Core": "Admin Core",
  "System_Matrix": "System Matrix",
  "Ad_Matrix": "Ad Matrix",
  "New_Ad": "New Ad",
  "All_Units": "All Units",
  "Ctrl_Center": "Ctrl Center",
  "SEARCH_ADS...": "SEARCH ADS..."
};

let totalChanges = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp("\\b" + key + "\\b", "g");
    content = content.replace(regex, value);
  }

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    totalChanges++;
    console.log("Updated", f);
  }
});

console.log("Total files updated:", totalChanges);
