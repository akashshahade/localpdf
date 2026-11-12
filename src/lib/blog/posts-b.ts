import type { Post } from "./types";

export const postsB: Post[] = [
  {
    slug: "pdf-to-word-without-uploading",
    title: "How to Convert PDF to Word Without Uploading",
    description:
      "Turn a PDF into an editable DOCX file in your browser. What converts well, what doesn't, and how to handle scanned PDFs — all without uploading your document.",
    published: "2026-11-01",
    category: "How-to",
    tools: ["pdf-to-word", "extract-text", "edit-pdf"],
    answer:
      "To convert a PDF to Word without uploading it, open a local PDF-to-Word converter, add your file and download the DOCX. Text, headings and simple tables convert well. Scanned PDFs don't convert, because they contain images of text rather than real text.",
    body: `
## How do I convert PDF to Word?

1. Open [PDF to Word](/pdf-to-word) and drop in your file.
2. Click **Convert to Word**.
3. Open the DOCX in Word, Google Docs or LibreOffice and check the layout.

## What converts well and what doesn't?

| Content | Result |
| --- | --- |
| Paragraphs and headings | Converts well |
| Simple tables | Usually converts well |
| Multi-column layouts | May need tidying |
| Scanned pages | No text to convert |
| Complex designs and forms | Best kept as PDF |

## My PDF is a scan. What should I do?

A scan is a picture of a page, so there's no text to convert. LocalPDF's on-device OCR is coming soon. For small changes in the meantime, [Edit PDF](/edit-pdf) lets you cover and retype text directly on the page.

## Should I edit the PDF instead?

For small changes — fixing a typo, adding a line, signing — it's often faster to use [Edit PDF](/edit-pdf) and keep the original layout.
`,
    faqs: [
      { q: "Will my fonts be preserved?", a: "Fonts installed on your computer are kept. Unusual fonts may be replaced with similar ones in Word." },
      { q: "Can I convert a password-protected PDF?", a: "Remove the password first with Remove password if you know it, then convert." },
      { q: "Is the conversion private?", a: "Yes. LocalPDF converts on your device, so the document is never uploaded." },
    ],
  },
  {
    slug: "local-vs-cloud-pdf-tools",
    title: "Local vs Cloud PDF Tools: What's the Difference?",
    description:
      "Cloud PDF tools upload your files to a server; local tools process them on your device. Compare privacy, speed, limits and offline use to pick the right one.",
    published: "2026-11-03",
    category: "Guides",
    tools: ["merge-pdf", "compress-pdf", "edit-pdf"],
    answer:
      "Cloud PDF tools upload your file to a remote server for processing, while local PDF tools process it on your own device — either in a desktop app or directly in your browser. Local tools are more private, work offline and have no upload wait; cloud tools can offload very heavy jobs to powerful servers.",
    body: `
## What is a cloud PDF tool?

A cloud PDF tool sends your file over the internet to a company's server, processes it there and returns the result. Most well-known free PDF websites work this way.

## What is a local PDF tool?

A local PDF tool does all the work on your device. Browser-based local tools download their processing engine once — often written in WebAssembly for near-native speed — and then run it inside your browser tab.

## How do they compare?

| | Local (in-browser) | Cloud |
| --- | --- | --- |
| Where your file goes | Stays on your device | Uploaded to a server |
| Privacy | Nothing to leak or retain | Depends on the provider |
| Works offline | Yes, after first load | No |
| Upload/download wait | None | Grows with file size |
| Very heavy jobs | Limited by your device | Can use powerful servers |
| Account needed | No | Often for full features |

## When should I use a local tool?

Use a local tool whenever the document is personal or confidential — IDs, bank statements, contracts, medical or HR files — or when you're on slow or no internet.

## When might a cloud tool make sense?

For extremely large batch jobs on a low-powered device, a server can be faster. For everyday merging, compressing, signing and converting, modern laptops and phones are more than fast enough.
`,
    faqs: [
      { q: "Are local PDF tools slower?", a: "Usually not. You skip the upload and download, which is often the slowest part. Heavy tasks like OCR depend on your device's speed." },
      { q: "How do I know a website is processing locally?", a: "Open the browser's Network tab while using it, or turn off your internet after the page loads. A local tool keeps working and never sends your file." },
      { q: "Is LocalPDF a local or cloud tool?", a: "Local. Every tool runs in your browser and your files are never uploaded." },
    ],
  },
  {
    slug: "split-pdf-into-pages",
    title: "How to Split a PDF Into Separate Pages or Ranges",
    description:
      "Split a PDF into single pages, custom page ranges or size-limited parts. Free, private and fast — step-by-step instructions with examples.",
    published: "2026-11-05",
    category: "How-to",
    tools: ["split-pdf", "extract-pages", "split-in-half"],
    answer:
      "To split a PDF, open a PDF splitter, choose how to split — by page ranges like 1-3, 4-8, into every single page, or by file size — then download the parts as a ZIP. Each part is a normal PDF with the original quality.",
    body: `
## How do I split a PDF?

1. Open [Split PDF](/split-pdf) and drop in your file.
2. Choose **Split by**: Ranges, Every page or File size.
3. For ranges, type something like **1-3, 4-8, 9** — each range becomes one file.
4. Click **Split PDF** and download the ZIP.

## Which split option should I use?

| Goal | Option |
| --- | --- |
| Separate chapters or documents | Ranges |
| One file per page | Every page |
| Fit each part under an email limit | File size |
| Keep only some pages | [Extract pages](/extract-pages) |
| Book scans with two pages per sheet | [Split pages in half](/split-in-half) |

## How do I write page ranges?

- Use a hyphen for a range: **2-5**
- Separate parts with commas: **1, 3-4, 10**
- Each comma-separated item becomes its own PDF.
`,
    faqs: [
      { q: "Does splitting reduce quality?", a: "No. Pages are copied exactly as they are." },
      { q: "Why do I get a ZIP file?", a: "When splitting creates several PDFs, they're bundled into one ZIP so you can download them together." },
      { q: "Can I split a scanned PDF?", a: "Yes. Splitting works on any PDF, scanned or digital." },
    ],
  },
  {
    slug: "rotate-pdf-pages-permanently",
    title: "How to Rotate PDF Pages and Save Them That Way",
    description:
      "Fix sideways or upside-down pages for good. Rotate a whole PDF or just selected pages by 90°, 180° or 270°, then save — free and without uploading.",
    published: "2026-11-07",
    category: "How-to",
    tools: ["rotate-pdf", "organize-pages"],
    answer:
      "To rotate PDF pages permanently, open a PDF rotation tool, select the pages that are sideways (or leave all selected), choose 90°, 180° or 270° and save. Rotating in a normal viewer only changes your view; saving with a rotation tool changes the file so it opens correctly everywhere.",
    body: `
## Why does my PDF keep opening sideways?

Most PDF viewers let you rotate the view, but that doesn't change the file. When you reopen it or send it to someone, it's sideways again. A rotation tool saves the new orientation into the PDF.

## How do I rotate pages step by step?

1. Open [Rotate PDF](/rotate-pdf) and drop in your file.
2. Click the pages that need rotating. Leave none selected to rotate all pages.
3. Choose **90°**, **180°** or **270°** — the thumbnails preview the result.
4. Click **Rotate pages** and download.

## What if different pages need different rotations?

Use [Organize pages](/organize-pages). Hover over any page to rotate it left or right individually, reorder pages and remove extras, then save once.

| Page looks | Rotate by |
| --- | --- |
| Lying on its right side | 90° |
| Upside down | 180° |
| Lying on its left side | 270° |
`,
    faqs: [
      { q: "Does rotating reduce quality?", a: "No. Rotation changes the page orientation without re-rendering the content." },
      { q: "Can I rotate just one page?", a: "Yes. Select just that page in Rotate PDF, or use Organize pages to rotate pages individually." },
      { q: "Will the rotation stick when I email the file?", a: "Yes. The new orientation is saved in the PDF itself." },
    ],
  },
  {
    slug: "why-is-my-pdf-so-large",
    title: "Why Is My PDF So Large? 6 Common Causes and Fixes",
    description:
      "High-resolution images, embedded fonts, scans and hidden data make PDFs heavy. Find out what's inflating your file and how to shrink it safely.",
    published: "2026-11-10",
    category: "Guides",
    tools: ["pdf-size-analyzer", "compress-pdf", "flatten-pdf", "edit-metadata"],
    answer:
      "A PDF is usually large because of high-resolution images or scans, fully embedded fonts, many pages, duplicated resources, or hidden data like thumbnails and editing history. Images are the most common cause. Analyse the file to see what's taking space, then compress images or remove what you don't need.",
    body: `
## What makes a PDF large?

| Cause | How common | Fix |
| --- | --- | --- |
| High-resolution images and scans | Very common | [Compress PDF](/compress-pdf) |
| Fully embedded fonts | Common | Compression with font subsetting |
| Colour scans of black-and-white pages | Common | Compress with grayscale |
| Many pages | Sometimes | [Split](/split-pdf) or [extract](/extract-pages) pages |
| Duplicate images on every page | Sometimes | Compression removes duplicates |
| Hidden data and layers | Occasionally | [Flatten](/flatten-pdf) and clean [metadata](/edit-metadata) |

## How do I find out what's making my PDF big?

Open [Why is my PDF big?](/pdf-size-analyzer) and drop in the file. You'll see how much space goes to images, fonts, page content and other data, plus suggestions for what would shrink it.

## 1. High-resolution images

Phone photos and scans are often saved at far higher resolution than a screen or printer needs. Recompressing them is the single biggest saving.

## 2. Embedded fonts

PDFs can embed entire font files so text looks right everywhere. Subsetting keeps only the characters actually used.

## 3. Colour scans

A colour scan of a black-and-white letter stores three times the data it needs. Grayscale or black-and-white saves a lot.

## 4. Lots of pages

Sometimes the file is simply long. Share only the pages that matter.

## 5. Duplicated resources

Logos or backgrounds repeated on every page may be stored many times. Good compression stores them once.

## 6. Hidden data

Thumbnails, form data, comments and editing history add weight. Flattening and cleaning metadata removes them.
`,
    faqs: [
      { q: "Why is a one-page PDF 10 MB?", a: "Almost always because it contains a large image, such as a full-resolution phone photo or a high-DPI colour scan." },
      { q: "Does compressing remove text?", a: "No. Real text is kept. Compression focuses on images, fonts and duplicated data." },
      { q: "What's a reasonable size for a text PDF?", a: "A text-only document is often well under 1 MB even with dozens of pages. Large sizes usually point to images." },
    ],
  },
];
