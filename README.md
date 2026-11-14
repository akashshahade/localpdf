<p align="center">
  <img src="public/brand/github-banner.jpg?v=2" alt="LocalPDF — Free PDF tools. Zero uploads." width="100%" />
</p>

<h1 align="center">LocalPDF</h1>

<p align="center">
  <strong>Free PDF tools that run entirely in your browser.</strong><br />
  No upload. No sign-up. No watermark. Your files never leave the device.
</p>

<p align="center">
  <a href="https://www.editlocalpdf.com"><img src="https://img.shields.io/badge/Live%20site-editlocalpdf.com-FF4500?style=for-the-badge" alt="Live site" /></a>
  &nbsp;
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-PolyForm%20Noncommercial-0f172a?style=for-the-badge" alt="License" /></a>
  &nbsp;
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs" alt="Next.js 16" />
  &nbsp;
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<p align="center">
  <a href="https://www.editlocalpdf.com">Open the app</a>
  ·
  <a href="https://www.editlocalpdf.com/blog">Guides</a>
  ·
  <a href="#license">License</a>
</p>

---

## Why LocalPDF

Most free PDF sites upload your file to a server. LocalPDF does the work **in the tab** with pdf.js and pdf-lib. Close the tab and the document is gone. After the first visit it also works offline as a PWA.

## What it does

| Category | Examples |
| --- | --- |
| Organize | Merge, split, extract, rearrange, rotate, delete pages |
| Optimize | Compress, repair, inspect |
| Edit & sign | Text, signatures, stamps, forms |
| Photo | Resize photos and signatures for exam / KYC / PAN forms |
| Security | Passwords, redaction, integrity |
| Convert | Images, Office, HTML, Markdown ⇄ PDF |

50+ tools. One job per URL (`/merge-pdf`, `/compress-pdf`, …).

https://github.com/user-attachments/assets/a17c71ed-387e-4f24-9df4-061ee5549085

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + Radix UI
- Client-side engines: pdf.js, pdf-lib, mammoth, docx

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: copy `.env.example` and set `NEXT_PUBLIC_SITE_URL` for canonical URLs.

```
NEXT_PUBLIC_SITE_URL=https://www.editlocalpdf.com
```

## Using the site vs using the code

| | |
| --- | --- |
| **editlocalpdf.com** | Free for everyone, including commercial work on *your* PDFs |
| **This repository** | Source-available. Not MIT |

## License

[PolyForm Noncommercial License 1.0.0](LICENSE)

- Personal, hobby, research, and education: allowed (keep copyright + license)
- Running this as a competing product, SaaS, or paid service: **needs a commercial license**

Commercial license: [hello@editlocalpdf.com](mailto:hello@editlocalpdf.com)

---

<p align="center">
  Built by <a href="https://www.linkedin.com/in/akashshahade">Akash Shahade</a>
  ·
  <a href="https://www.editlocalpdf.com">editlocalpdf.com</a>
</p>
