# Project Rules

## API Backend URLs
- NEVER add fallback hardcoded URLs (such as `http://127.0.0.1:8000`, `http://127.0.0.1:8081`, `http://localhost`, etc.) for backend requests in any service, config, or helper file.
- ALWAYS read backend URLs strictly from environment variables (`.env` file via `import.meta.env` or container runtime environment variables via `window`).
- If an environment variable is not defined, DO NOT substitute it with a default/fallback URL under any circumstances. Allow the request to fail or raise an error naturally.
