# GitHub Issues Dashboard

A web-based dashboard for visualizing and managing GitHub issues from any repository. This is the first phase of a larger GitHub Issues Integration platform that will integrate with Devin for automated issue scoping and resolution.

## Features

- View issues from any public GitHub repository
- Filter issues by state (open/closed/all), sort order, and assignee
- View detailed issue information including labels, assignees, milestones, and descriptions
- Statistics overview showing total, open, and closed issue counts
- Dark mode support
- Configurable GitHub token for increased rate limits and private repository access

## Getting Started

1. Clone the repository and install dependencies:

```bash
npm install
```

2. (Optional) Set up your GitHub token for increased rate limits:

```bash
cp .env.example .env.local
# Edit .env.local and add your GitHub token
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Configuration

You can configure the repository and GitHub token directly in the dashboard UI by clicking on "Repository Configuration". Alternatively, you can set the `NEXT_PUBLIC_GITHUB_TOKEN` environment variable for persistent authentication.

### GitHub Token

A GitHub Personal Access Token is optional but recommended. Without a token, you're limited to 60 API requests per hour. With a token, you get 5,000 requests per hour.

Create a token at: https://github.com/settings/tokens

Required scopes:
- `public_repo` - for public repositories only
- `repo` - for private repositories

## Future Phases

This dashboard is the first phase of a larger GitHub Issues Integration platform:

1. **Phase 1 (Current)**: GitHub Issues Dashboard - Visualize issues from any repository
2. **Phase 2**: Devin Integration - Trigger Devin sessions to scope issues and assign confidence scores
3. **Phase 3**: Automated Resolution - Trigger Devin sessions to complete tickets based on action plans

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- GitHub REST API
