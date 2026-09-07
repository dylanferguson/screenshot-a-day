# screenshot-a-day

Capture a webpage at 1042 × 1600, save `YYYY-MM-DD.png`, and upload it to S3. Runs once; schedule externally. Same-day runs overwrite the image. Dates use the host timezone (`TZ` overrides it).

## Run

Requires [mise](https://mise.jdx.dev/getting-started.html) activated in your shell, pnpm, and an existing S3 bucket. Node 24 is managed by `mise.toml`.

```sh
mise install
pnpm install
cp .env.example .env
pnpm browser:install
```

Set `URL`, `BUCKET_NAME`, and `AWS_REGION` in `.env`. Optional settings are in [.env.example](.env.example). To use installed Chrome, set `BROWSER_CHANNEL=chrome` and skip the browser download.

Authenticate locally with [AWS CLI 2.32+](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sign-in.html):

```sh
aws login --profile screenshot-a-day
AWS_PROFILE=screenshot-a-day pnpm start
```

For a configured SSO profile, use `aws sso login` instead. For scheduled runs, use an IAM role or OIDC. Grant `s3:PutObject` on the target prefix; no permanent keys are needed.

## Develop

JavaScript with JSDoc types and compiled Zod validation. Vite+ handles dev checks; mise manages Node. No build step.

`pnpm install` installs Lefthook. Pre-commit runs `pnpm check` across the project.

```sh
pnpm check # Vite+: lint, format check, type-check
pnpm fmt   # Format
```
