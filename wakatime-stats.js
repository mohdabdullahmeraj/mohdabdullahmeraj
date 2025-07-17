const fs = require("fs");
const axios = require("axios");

const API_KEY = process.env.WAKATIME_API_KEY;
const API_URL = "https://wakatime.com/api/v1/users/current/stats/all_time";

function createBar(percentage) {
  const totalBars = 30;
  const filledBars = Math.round((percentage / 100) * totalBars);
  return "█".repeat(filledBars) + "░".repeat(totalBars - filledBars);
}

(async () => {
  try {
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    const data = res.data.data.languages?.slice(0, 6) || [];
    console.log(res.data);
    const lines = data.map(lang => {
      const time = `${lang.hours} hrs ${lang.minutes} mins`.padEnd(17);
      const bar = createBar(lang.percent);
      const percent = lang.percent.toFixed(2).padStart(5) + " %";
      return `${lang.name.padEnd(12)} ${time} ${bar} ${percent}`;
    });

    const output = [
      "<!--START_WAKATIME_SECTION-->",
      "```txt",
      ...lines,
      "```",
      "<!--END_WAKATIME_SECTION-->"
    ].join("\n");

    const readme = fs.readFileSync("README.md", "utf-8");
    const updatedReadme = readme.replace(
      /<!--START_WAKATIME_SECTION-->[\s\S]*<!--END_WAKATIME_SECTION-->/,
      output
    );
    console.log("KEY EXISTS:", !!process.env.WAKATIME_API_KEY);
    fs.writeFileSync("README.md", updatedReadme);
    console.log("✅ WakaTime stats updated in README.md");
  } catch (err) {
    console.error("❌ Failed to fetch WakaTime stats:", err.message);
  }
})();
