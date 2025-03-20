# Astro Coffee Graphs

A visualization dashboard for espresso shots data stored in Airtable, built with Astro and Chart.js.

## Features

- Display monthly and daily espresso shot analytics
- Responsive charts using Chart.js
- Dark/light mode based on system preferences
- Custom monospace font styling
- Secure Airtable integration

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🚀 Deployment

This project is set up to deploy to GitHub Pages using GitHub Actions.

### Prerequisites

1. Push your code to a GitHub repository
2. Set up repository secrets for your Airtable credentials:
   - Go to your repository Settings > Secrets and variables > Actions
   - Add the following repository secrets:
     - `AIRTABLE_API_KEY`: Your Airtable API key
     - `AIRTABLE_BASE_ID`: Your Airtable base ID

### Configuration

Before deploying, make sure to update these files:

1. In `astro.config.mjs`, replace:
   - `USERNAME` with your GitHub username
   - `astro-coffee-graphs` with your repository name (if different)

2. After pushing to the `main` branch, GitHub Actions will automatically:
   - Build the project with your environment variables
   - Deploy to GitHub Pages

3. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Set the "Source" to "GitHub Actions"

Your site will be available at `https://USERNAME.github.io/astro-coffee-graphs/`
