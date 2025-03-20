// @ts-check
import { defineConfig } from "astro/config";
import fs from "node:fs";
import path from "node:path";

// Load environment variables directly from the .env file in the project root
function loadEnvFromFile() {
  try {
    const envPath = path.join(process.cwd(), ".env");
    const envContent = fs.readFileSync(envPath, "utf-8");
    const env = {};

    envContent.split("\n").forEach((line) => {
      // Skip comments and empty lines
      if (!line || line.startsWith("#")) return;

      const [key, value] = line.split("=");
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    });

    console.log("Loaded environment variables:", Object.keys(env));
    return env;
  } catch (error) {
    console.error("Error loading .env file:", error);
    return {};
  }
}

const envVars = loadEnvFromFile();

// https://astro.build/config
export default defineConfig({
  // For GitHub Pages deployment
  site: "https://pdavlin.github.io", // Replace USERNAME with your GitHub username
  base: "/astro-coffee-graphs", // Replace with your repository name
  vite: {
    define: {
      "import.meta.env.AIRTABLE_API_KEY": JSON.stringify(
        envVars.AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY,
      ),
      "import.meta.env.AIRTABLE_BASE_ID": JSON.stringify(
        envVars.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID,
      ),
    },
  },
});
