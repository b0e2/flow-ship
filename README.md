# FlowShip

FlowShip is a frontend CI/CD observability dashboard for visualizing the status
and reliability of GitHub Actions based deployment pipelines.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Project Structure

```txt
src/
  app/
  pages/
  features/
  shared/
  styles/
```

This setup intentionally keeps the first PR focused on the frontend foundation:
Tailwind CSS, the application shell, base provider composition, and the initial
FlowShip introduction screen.
