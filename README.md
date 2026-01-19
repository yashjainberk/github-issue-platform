# GitHub Issues Dashboard

A web-based dashboard for visualizing and managing GitHub issues from any repository. This is the first phase of a larger GitHub Issues Integration platform that will integrate with Devin for automated issue scoping and resolution.

## Features

- View issues from a configured GitHub repository
- Filter issues by state (open/closed/all), sort order, and assignee
- View detailed issue information including labels, assignees, milestones, and descriptions
- Statistics overview showing total, open, and closed issue counts
- Dark mode support
- Integrated Devin support for scoping and fixing issues
- Configurable via environment variables for easy setup

## Getting Started

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables:

```bash
cp .env.example .env.local
# Edit .env.local and add your GitHub configuration
```

Required environment variables in `.env.local`:
- `NEXT_PUBLIC_GITHUB_OWNER`: The GitHub repository owner (e.g., `facebook`)
- `NEXT_PUBLIC_GITHUB_REPO`: The GitHub repository name (e.g., `react`)
- `NEXT_PUBLIC_GITHUB_TOKEN`: (Optional) Your GitHub Personal Access Token
- `NEXT_PUBLIC_DEVIN_API_KEY`: (Optional) Your Devin API Key for integration features

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Configuration

The dashboard is configured via environment variables in your `.env.local` file. This allows for persistent configuration without having to manually enter credentials in the UI.

### GitHub Token

A GitHub Personal Access Token is optional but recommended. Without a token, you're limited to 60 API requests per hour. With a token, you get 5,000 requests per hour.

Create a token at: https://github.com/settings/tokens

Required scopes:
- `public_repo` - for public repositories only
- `repo` - for private repositories

