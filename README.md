# Prdashboard

An dashboard showing all PRs across different repos of a project.

When opening the dashboard it will ask for a PAT and the organisation name. You can also input your user email to directly view the votes you gave to a PR. The configuration is stored in local storage and read when the application is reloaded.

Data on the dashboard is refreshed in 30s intervals, providing and up-to-date overview of all open PRs.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.