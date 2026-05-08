# FlowShip

FlowShip is a frontend CI/CD observability dashboard for GitHub Actions based deployment pipelines.

It visualizes deployment status, pipeline progress, environment health, failure logs, and release notes in one dashboard.

## Live

Amplify:

```txt
https://main.d1cvodkenfaorb.amplifyapp.com
```

S3 static website:

```txt
http://mybucket-20263620.s3-website-us-east-1.amazonaws.com
```

## Features

- Deployment summary KPIs
- Deployment status trend chart
- Deployment count by environment chart
- GitHub Actions pipeline step view
- Production, staging, and development environment status
- Recent deployment history table
- Failure logs
- Deployment checklist
- Release notes
- Branch, environment, and status filters

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

FlowShip separates server state, client UI state, and local component state.

- Server state: TanStack Query
- UI filter state: Zustand
- Local widget state: React `useState`

The data layer is built around the GitHub Actions API. If workflow data is not available, FlowShip shows an empty state instead of generated placeholder data.

## Project Structure

```txt
src/
  app/
  pages/
  features/
    deployments/
      api/
      components/
      data/
      hooks/
      model/
      store/
      utils/
  shared/
  styles/
```

## Getting Started

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Deployment

The S3 deployment workflow runs on every push to `main`.

```txt
main push
→ npm ci
→ npm run build
→ aws s3 sync dist s3://S3_BUCKET_NAME --delete
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

## Amplify

`amplify.yml` is included for AWS Amplify Hosting.

- preBuild: `npm ci`
- build: `npm run build`
- artifacts: `dist`
