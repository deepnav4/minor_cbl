# StudySense (minor project)

Minor project — Turborepo monorepo.

```
minor/
├── apps/
│   ├── web/              # Next.js 16 (port 3000)
│   └── api/              # Express 5 (port 4000)
├── packages/
│   ├── pdf-client/       # client for the structured-pdf-data microservice
│   └── config/           # shared config
├── context/              # project memory — read this first to recover context
├── utils/
│   ├── project-report.tex
│   └── presentation.pptx
├── package.json
└── turbo.json
```

External microservice: **structured-pdf-data** — https://nvdp4-structured-pdf-data.hf.space
(details in `context/structured-pdf-data.md`).

## Getting started
```bash
npm install
cp .env.example .env
npm run dev
```
