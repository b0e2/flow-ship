# FlowShip

FlowShip is a frontend CI/CD observability dashboard for GitHub Actions based deployment pipelines.

Users connect a GitHub repository, then FlowShip queries real GitHub Actions workflow runs, jobs, and steps to visualize pipeline progress, deployment status, failures, and deploy target URL health.

## Development Flow

FlowShip started as a mock-data prototype to validate dashboard layout and information architecture. The product has since been upgraded into a real-data dashboard powered by the GitHub Actions API.

The final dashboard does not use mock deployment data. If GitHub Actions data is unavailable, FlowShip shows loading, error, or empty states instead of generated placeholder results.

## Live

Amplify:

```txt
https://main.d1cvodkenfaorb.amplifyapp.com
```

S3 static website:

```txt
http://mybucket-20263620.s3-website-us-east-1.amazonaws.com
```

## Major Features

- GitHub repository setup with owner, repo, branch, and optional token
- GitHub repository list loading through the GitHub API
- GitHub Actions workflow runs lookup
- Workflow jobs and steps lookup
- Real jobs/steps based Pipeline Visualizer
- Workflow run metrics from real API data
- Failure job/step details
- S3 and Amplify deploy target URL links
- Browser-based deploy target health checks with CORS guidance
- Loading, error, empty, and success states

## Tech Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- Recharts
- Lucide React
- GitHub Actions
- AWS S3
- AWS Amplify

## Architecture

FlowShip separates server state, persisted client state, and local component state.

- TanStack Query manages GitHub API server state:
  - workflow runs
  - workflow jobs and steps
  - workflows
  - deploy target health checks
- Zustand manages client UI and persisted configuration:
  - repository config
  - selected workflow run
- React `useState` manages local form and widget state.

The GitHub Actions API client lives under `src/features/github-actions/api`. Repository configuration lives under `src/features/repository`.

## Security Notes

- GitHub token is optional.
- Public repositories can be queried without a token.
- Private repositories or rate limit avoidance may require a GitHub token.
- Token values are treated as sensitive and are not displayed directly in the UI.
- A production service should prefer OAuth or a backend proxy instead of storing tokens in browser local storage.
- AWS Access Key ID and AWS Secret Access Key are not requested in the frontend.
- FlowShip does not use the AWS SDK in the browser.
- S3 and Amplify support is URL based in the dashboard.

## Getting Started

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Usage

1. Enter a GitHub owner.
2. Optionally enter a GitHub token.
3. Load repositories from the GitHub API or manually enter a repository name.
4. Confirm the branch.
5. Optionally enter S3 Website URL and Amplify URL.
6. Select `Connect Repository`.
7. Inspect workflow runs, pipeline steps, job details, and failure details.

FlowShip only renders data returned by the GitHub APIs. If a repository has no workflow runs, the dashboard shows an empty state.

## Deployment

The S3 deployment workflow runs on every push to `main`.

```txt
main push
-> npm ci
-> npm run build
-> aws s3 sync dist s3://S3_BUCKET_NAME --delete
```

Required GitHub Actions secrets:

```txt
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN
AWS_REGION
S3_BUCKET_NAME
```

`AWS_SESSION_TOKEN` is used for AWS Academy Learner Lab temporary credentials.

`amplify.yml` is included for AWS Amplify Hosting.

- preBuild: `npm ci`
- build: `npm run build`
- artifacts: `dist`

## Troubleshooting

### Repository Not Found

Check the owner, repository name, and branch. Private repositories require a token with access to the repository.

### GitHub API Rate Limit

Unauthenticated public API requests are rate limited. Add an optional GitHub token to increase the limit.

### No Workflow Runs

The selected repository and branch may not have GitHub Actions runs. FlowShip shows an empty state and does not create fake workflow history.

### Jobs Or Steps Missing

FlowShip displays only jobs and steps returned by the GitHub Actions API. If steps are missing in the API response, the UI shows an empty state for that area.

### Deploy Target Health Check Blocked

Some S3 or Amplify URLs do not allow browser-origin health checks. FlowShip shows a CORS guidance message and keeps the direct open link available.

### S3 Deploy Fails With AccessDenied

`aws s3 sync --delete` may require `s3:ListBucket`, `s3:PutObject`, `s3:DeleteObject`, and related object permissions. If the error says `explicit deny`, check bucket policy, IAM policy, permission boundaries, AWS Academy Learner Lab role limits, and the `S3_BUCKET_NAME` secret.

### Build Fails

Run:

```bash
npm install
npm run build
```

Fix TypeScript, lint, or dependency issues before deploying.

## Project Significance

FlowShip is not a static dashboard mockup. It observes real GitHub Actions deployment data and turns workflow runs, jobs, and steps into an operational frontend deployment view.

The project demonstrates the progression from a mock prototype into a real API based product focused on frontend deployment reliability and visibility.
