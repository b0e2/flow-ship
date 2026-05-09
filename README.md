# FlowShip

FlowShip is a multi repository deployment control center for frontend projects that deploy through GitHub Actions.

Users register GitHub repositories, then FlowShip queries real GitHub Actions workflow runs, jobs, and steps to visualize deployment progress, pipeline dependency flow, failure diagnosis, and deploy target URL health.

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

- Multi repository setup with owner, repo, branch, and optional token
- GitHub repository list loading through the GitHub API
- GitHub Actions workflow runs lookup
- Workflow jobs and steps lookup
- Real jobs/steps based Pipeline Dependency Graph
- Failure Diagnosis with likely causes and recommended actions
- Workflow run metrics from real API data
- Failure job/step details
- S3 and Amplify deploy target URL links
- Browser-based deploy target health checks with CORS guidance
- Local Workspace Account for separating browser-local repository settings by user
- Private and organization repository lookup when a GitHub token is provided
- Token validation against the GitHub `/user` API
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
  - repository latest run summaries
  - workflows
  - deploy target health checks
- Zustand manages client UI and persisted configuration:
  - registered repositories
  - active repository
  - selected workflow run
  - local workspace auth session
- React `useState` manages local form and widget state.

The GitHub Actions API client lives under `src/features/github-actions/api`. Repository configuration lives under `src/features/repository`.

## Local Workspace Account

FlowShip is a frontend-only demo, so it uses a Local Workspace Account instead of a real backend authentication system.

- Users can sign up and log in locally in the browser.
- Passwords are stored as SHA-256 hashes with the email included in the hash input, not as plain text.
- Repository settings are separated per local user in `localStorage`.
- This is not production-grade authentication. A real service should use backend auth, secure sessions, and GitHub OAuth or a backend proxy.

## Private And Organization Repositories

Public repositories can be loaded without a token. When a GitHub token is provided, FlowShip validates it with `GET /user` and uses `GET /user/repos?visibility=all&affiliation=owner,collaborator,organization_member` so repositories owned by the user, collaborator repositories, private repositories, and organization-member repositories can be listed when the token has access.

Token permission guidance:

- Fine-grained token: verify Repository access and Actions read permission.
- Classic token: `repo`, `workflow`, and `read:org` may be required.
- Token values are never displayed directly in the UI.
- Tokens are stored only in this browser's localStorage as part of the repository config. Treat them as sensitive.
- For production, GitHub OAuth or a backend proxy is recommended.

## Control Center Layout

The dashboard is designed as a full-width deployment control center:

- Left panel: project overview and repository list.
- Center panel: active repository Pipeline Dependency Graph and selected node detail.
- Right panel: Failure Diagnosis and Deployment Health.
- Bottom panel: workflow metrics, recent runs, and job/step details.

The layout prioritizes quickly answering what is deploying, where it is stuck or failed, and what action to take next.

## Security Notes

- GitHub token is optional.
- Public repositories can be queried without a token.
- Private repositories, organization repositories, or rate limit avoidance may require a GitHub token.
- Token values are treated as sensitive and are not displayed directly in the UI.
- Browser localStorage is not a secure secret vault. Use the token feature carefully in this frontend-only demo.
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

1. Sign up or log in with a Local Workspace Account.
2. Add one or more GitHub repositories.
3. Enter a GitHub owner.
4. Optionally enter and validate a GitHub token for private or organization repositories.
5. Load repositories from the GitHub API or manually enter repository details.
6. Select a repository and confirm the branch.
7. Optionally enter S3 Website URL and Amplify URL.
8. Select an active repository from the project list.
9. Inspect the Pipeline Dependency Graph, failure diagnosis, deploy target health, workflow runs, and job details.

FlowShip only renders data returned by the GitHub APIs. If a repository has no workflow runs, jobs, or steps, the dashboard shows an empty state.

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

### Private Or Organization Repositories Missing

Validate the token in the repository wizard. Fine-grained tokens need repository access and Actions read permission. Classic tokens may need `repo`, `workflow`, and `read:org`.

### GitHub API Rate Limit

Unauthenticated public API requests are rate limited. Add an optional GitHub token to increase the limit.

### No Workflow Runs

The selected repository and branch may not have GitHub Actions runs. FlowShip shows an empty state and does not create fake workflow history.

### Jobs Or Steps Missing

FlowShip displays only jobs and steps returned by the GitHub Actions API. If steps are missing in the API response, the UI shows an empty state for that area.

### Failure Diagnosis Looks Incomplete

GitHub Actions jobs/steps API does not include full log text. FlowShip diagnoses likely causes from real failed job and step names, status, and conclusion. Open the GitHub Actions detail link for full logs.

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

FlowShip is not a static dashboard mockup. It observes real GitHub Actions deployment data and turns workflow runs, jobs, and steps into a multi project deployment control center.

The project demonstrates the progression from a mock prototype into a real API based product focused on frontend deployment reliability, dependency visualization, and failure diagnosis.
