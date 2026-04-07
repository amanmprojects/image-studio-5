This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Install dependencies with Bun:

```bash
bun install
```

## Environment Setup

Copy the example environment file and fill in the required values:

```bash
cp .env.example .env
```

Required variables:

- `BETTER_AUTH_SECRET`: random secret used to sign auth sessions.
- `BETTER_AUTH_URL`: app base URL, for local development use `http://localhost:3000`.
- `BETTER_AUTH_TRUSTED_ORIGINS`: comma-separated allowed origins, for local development use `http://localhost:3000`.
- `SQLITE_DATABASE_PATH`: local SQLite database path, for example `./image-studio.db`.
- `GOOGLE_GENERATIVE_AI_API_KEY`: Google API key for Gemini/Imagen image generation.
- `AWS_REGION`: AWS region for your S3 bucket.
- `AWS_S3_BUCKET`: S3 bucket that stores generated images.
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: AWS credentials for local development if they are not already provided by your shell or profile.

Optional variable:

- `S3_PUBLIC_URL_BASE`: use this if your bucket or CDN serves public image URLs directly. If omitted, the app returns signed S3 URLs.

Then run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## AWS Deployment

This app is set up for a container deployment using Next.js standalone output. The included `Dockerfile` is suitable for pushing to ECR and deploying to an AWS container service such as App Runner.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
## Setup instructions
