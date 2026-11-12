import type { Post } from "./types";

export const postsA: Post[] = [
  {
    slug: "merge-pdf-without-uploading",
    title: "How to Merge PDF Files Without Uploading Them",
    description:
      "Combine several PDFs into one file directly in your browser. No upload, no sign-up, no watermark — step-by-step instructions plus tips for ordering and file size.",
    published: "2026-09-02",
    updated: "2026-11-04",
    category: "How-to",
    tools: ["merge-pdf", "organize-pages", "compress-pdf"],
    answer:
      "To merge PDFs without uploading them, open a local, browser-based merger such as LocalPDF Merge PDF, drop in your files, drag them into order and click Merge. The files are combined on your own device, so nothing is sent to a server and the result downloads instantly.",
    body: `
## Why merge PDFs locally?

Most online mergers upload your files to a remote server, process them there and send the result back. That works, but it means copies of your offer letters, bank statements or contracts sit on someone else's computer — even if only for an hour. A local merger does the same job inside your browser tab, so the files never leave your device.

## How do I merge PDF files step by step?

1. Open [Merge PDF](/merge-pdf).
2. Drag your PDFs onto the drop area, or click **Choose files**.
3. Drag the files into the order you want. The first file becomes the first pages.
4. Optional: turn on **Add a bookmark per file** so readers can jump between sections.
5. Click **Merge PDFs** and download the combined file.

> Tip: Rename files before you start ("01-cover.pdf", "02-letter.pdf"). They're much easier to put in order.

## Can I reorder individual pages, not just files?

Yes. Merge first, then open the result in [Organize pages](/organize-pages). You'll see every page as a thumbnail and can drag, rotate or delete pages before saving.

## Will the merged file be too big to email?

Merging adds the file sizes together, so three 5 MB scans make a roughly 15 MB PDF. If you need it smaller, run the result through [Compress PDF](/compress-pdf). Scanned documents usually shrink the most.

| Situation | What to do |
| --- | --- |
| Pages in the wrong order | Use Organize pages after merging |
| Mixed A4 and Letter pages | Turn on "Make every page the same size" |
| File too large to send | Compress the merged PDF |
| Need page numbers | Run Page numbers on the result |

## Is merging locally as good as an online service?

For merging, yes. Combining PDFs doesn't need special server hardware — your laptop or phone does it in seconds. The only real limit is your device's memory, and most devices handle hundreds of pages comfortably.
`,
    faqs: [
      { q: "Is there a limit on how many PDFs I can merge?", a: "No fixed limit. Because merging runs on your device, the practical limit is your device's memory. Most laptops can merge dozens of files and hundreds of pages." },
      { q: "Does merging reduce the quality of my PDFs?", a: "No. Merging copies pages as they are, so text, images and fonts stay exactly the same." },
      { q: "Can I merge PDFs on my phone?", a: "Yes. LocalPDF works in mobile browsers, so you can pick files from your phone's storage and merge them without installing an app." },
    ],
  },
  {
    slug: "compress-pdf-for-email",
    title: "How to Compress a PDF for Email (Without Ruining It)",
    description:
      "Shrink a PDF so it fits under email attachment limits while keeping text sharp. Learn which compression level to choose and why scanned PDFs shrink the most.",
    published: "2026-09-09",
    category: "How-to",
    tools: ["compress-pdf", "pdf-size-analyzer", "split-pdf"],
    answer:
      "To compress a PDF for email, open a PDF compressor, choose a balanced compression level and download the smaller file. Most of a PDF's size comes from images, so recompressing them typically cuts scanned documents by half or more while keeping text readable. Gmail allows attachments up to 25 MB.",
    body: `
## Why is my PDF too big to email?

Email services limit attachment size. Gmail allows up to 25 MB per message, and many work email servers set lower limits. PDFs get large mainly because of images: phone scans, photos and screenshots saved at high resolution.

## How do I compress a PDF step by step?

1. Open [Compress PDF](/compress-pdf).
2. Drop in your PDF.
3. Choose a level:
   - **Light** keeps the best quality.
   - **Balanced** is right for most documents.
   - **Strong** gives the smallest file, best for scans you only need to read.
4. Click **Compress** and check the before-and-after size.
5. Open the result and zoom in on small text before you send it.

## Which compression level should I use?

| Document type | Recommended level | Why |
| --- | --- | --- |
| Text-only report | Light | Little to gain; keeps fonts crisp |
| Scanned letter or ID | Balanced | Big savings, still readable |
| Photo-heavy brochure | Balanced | Images shrink the most |
| Long scan you only need to read | Strong | Smallest possible file |

## What if it's still too big after compressing?

First, find out why. [Why is my PDF big?](/pdf-size-analyzer) shows how much space images, fonts and pages take. If the file is mostly pages rather than images, [split it](/split-pdf) into two attachments, or share only the pages that matter.

> Tip: Converting to grayscale helps a lot with colour scans of black-and-white documents.

## Is it safe to compress confidential PDFs online?

It is when the compression happens on your device. With a local tool, your contract or payslip is processed in the browser and never uploaded, so there's no copy on a server.
`,
    faqs: [
      { q: "Does compressing a PDF make the text blurry?", a: "Real text in a PDF stays sharp because compression mainly targets images. Scanned pages are images, so very strong compression can soften them — use Balanced for scans you need to read clearly." },
      { q: "How much smaller will my PDF get?", a: "It depends on the content. Image-heavy and scanned PDFs often shrink by 50–80%. Files that are mostly text may only shrink a little because they're already efficient." },
      { q: "Can I compress several PDFs at once?", a: "Yes. Compress PDF accepts multiple files and compresses each one separately." },
    ],
  },
  {
    slug: "is-it-safe-to-upload-pdfs-online",
    title: "Is It Safe to Upload PDFs to Online Converters?",
    description:
      "What really happens to your files when you upload them to free PDF websites, the risks for IDs and bank statements, and how local, in-browser tools avoid them.",
    published: "2026-09-16",
    category: "Privacy",
    tools: ["redact-pdf", "auto-redact-pii", "encrypt-pdf"],
    answer:
      "Uploading PDFs to online converters means a copy of your file is sent to and processed on someone else's server. Reputable services delete files after a few hours, but you can't verify that. For IDs, bank statements and contracts, a local tool that processes files in your browser is safer because the file never leaves your device.",
    body: `
## What happens when you upload a PDF to a converter?

A typical online PDF tool works like this: your browser sends the file to the company's server, the server processes it, stores the result temporarily and gives you a download link. Most services promise to delete files after one to 24 hours.

That promise may be honest, but you can't check it. Your file could also be logged, cached, backed up or exposed if the service is breached.

## What are the real risks?

- **Data breaches.** Any server that stores files can be hacked.
- **Retention you can't verify.** "Deleted after an hour" depends on the provider doing exactly that.
- **Third parties.** Some free sites route files through other services or ad networks.
- **Compliance.** Uploading client or patient documents may break your company's data policies or laws like GDPR.

## Which documents should never be uploaded?

| Document | Why it's sensitive |
| --- | --- |
| Passport, Aadhaar, PAN, driver's licence | Identity theft |
| Bank and salary statements | Financial fraud |
| Contracts and NDAs | Confidential business terms |
| Medical records | Highly personal, often regulated |
| Tax returns | Contain nearly everything above |

## What is a local PDF tool?

A local PDF tool is a website or app that does the processing on your own device instead of a server. In a browser-based local tool, the processing code is downloaded to your browser and runs there. Your document is read from your disk into the tab's memory, processed, and saved back — it never crosses the internet.

## How can I check a tool doesn't upload my file?

1. Open the tool and your browser's developer tools (F12), then the **Network** tab.
2. Add your file and run the tool.
3. Look for any request that sends a large amount of data. With a local tool, you'll only see the app's own files loading.
4. Even better: load the page, turn off Wi-Fi, and try again. If it still works, it's processing locally.

> LocalPDF is built this way. You can confirm it by turning off your internet after the page loads — the tools keep working.
`,
    faqs: [
      { q: "Are popular PDF websites unsafe?", a: "Not necessarily. Many have good security. The point is that any upload creates a copy you don't control. For sensitive files, not uploading at all removes that risk entirely." },
      { q: "Is a desktop app safer than a website?", a: "A desktop app that processes files offline is as private as a local browser tool. A browser-based local tool has the advantage of needing no installation and being easy to verify with the Network tab." },
      { q: "Does incognito mode protect my uploaded files?", a: "No. Incognito only stops your browser from saving history. If a site uploads your file, the server still receives it." },
    ],
  },
  {
    slug: "sign-pdf-free-no-account",
    title: "How to Sign a PDF for Free, Without an Account",
    description:
      "Add your signature to a PDF in under a minute — type, draw or upload it, place it on the page and download. No sign-up, no watermark, nothing uploaded.",
    published: "2026-09-23",
    category: "How-to",
    tools: ["sign-pdf", "fill-pdf-form", "flatten-pdf"],
    answer:
      "To sign a PDF for free without an account, open a browser-based signing tool, create your signature by typing, drawing or uploading it, click where it should go on the page and download the signed file. With a local tool like LocalPDF, the document never leaves your device.",
    body: `
## How do I sign a PDF step by step?

1. Open [Sign PDF](/sign-pdf) and drop in your document.
2. In the settings panel, type your name and pick a style — Script, Formal or Initials.
3. Choose **Signature** in the toolbar and click on the page where you want to sign.
4. Add a date or checkmark with the **Text** and **Checkmark** tools if needed.
5. Click **Apply signature** and download the signed PDF.

## Is a typed or drawn signature legally valid?

A typed, drawn or pasted signature is an **electronic signature**. Many countries accept electronic signatures for everyday agreements, but rules differ by country and document type — some documents require a certificate-based digital signature or a wet ink signature. If it matters legally, check with the organisation asking for your signature.

| Type | What it is | Typical use |
| --- | --- | --- |
| Electronic signature | Typed, drawn or image signature on the page | Offer letters, forms, everyday agreements |
| Digital signature | Cryptographic, certificate-based | Government filings, regulated documents |
| Wet signature | Ink on paper, then scanned | When explicitly required |

## How do I stop someone editing the signed PDF?

After signing, run the file through [Flatten PDF](/flatten-pdf). Flattening merges signatures, form fields and comments into the page, so they can't be moved or edited in a normal PDF viewer.

## Can I fill in a form and sign it?

Yes. Use [Fill PDF form](/fill-pdf-form) to complete the fields, then add your signature. Turn on **Lock answers after filling** so the form looks the same in every viewer.
`,
    faqs: [
      { q: "Do I need to create an account to sign a PDF?", a: "No. LocalPDF needs no account, email or payment. Open the tool, sign and download." },
      { q: "Is my signature stored anywhere?", a: "No. Your signature exists only in your browser while you work. It isn't uploaded or saved." },
      { q: "Can I sign on my phone?", a: "Yes. Open Sign PDF in your mobile browser, type your name or draw with your finger, and tap where you want to sign." },
    ],
  },
  {
    slug: "how-to-redact-a-pdf",
    title: "How to Redact a PDF Properly (Black Boxes Aren't Enough)",
    description:
      "Drawing a black box over text doesn't remove it. Learn how real PDF redaction works, how to redact safely for free, and how to check nothing is left behind.",
    published: "2026-09-30",
    category: "Privacy",
    tools: ["redact-pdf", "redaction-checker", "auto-redact-pii"],
    answer:
      "To redact a PDF properly, use a redaction tool that deletes the underlying text and images, not one that just draws a black box on top. Mark the areas, apply the redactions, strip hidden metadata, then check the result by trying to select or search the redacted text. If you can still copy it, it wasn't redacted.",
    body: `
## Why aren't black boxes enough?

A PDF is made of layers. If you draw a black rectangle over a name, the name is still in the file underneath. Anyone can often select the text, copy it, or remove the box. This mistake has exposed confidential information in court filings and government documents.

**Real redaction** deletes the content under the marked area and replaces it with a solid box, so there is nothing left to recover.

## How do I redact a PDF step by step?

1. Open [Redact PDF](/redact-pdf) and drop in your file.
2. Choose **Redact area** and click over each piece of sensitive information.
3. Optional: type a word or number into **Find & redact text** to catch every occurrence.
4. Keep **Also strip hidden metadata** turned on.
5. Click **Apply redactions** and download.

## How can I check the redaction worked?

1. Open the redacted PDF and try to select text in the blacked-out area.
2. Use Find (Ctrl+F) to search for a redacted word.
3. Or run the file through the [Redaction checker](/redaction-checker), which flags text still hiding under boxes.

## What should I redact?

| Information | Example |
| --- | --- |
| Identity numbers | Aadhaar, PAN, passport, SSN |
| Financial details | Account and card numbers |
| Contact details | Phone numbers, emails, addresses |
| Hidden data | Author name, comments, document history |

> Tip: [Auto-redact PII](/auto-redact-pii) can find emails, phone numbers and ID numbers for you. Always review what it found before applying.
`,
    faqs: [
      { q: "Can redacted text be recovered?", a: "Not if it was properly redacted, because the text is deleted from the file. It can be recovered if someone only drew a box or highlight over it." },
      { q: "Does printing to PDF redact a document?", a: "Printing can flatten a black box onto the page, but it is easy to get wrong and doesn't remove metadata. A proper redaction tool is more reliable." },
      { q: "Is it safe to redact a document online?", a: "Only if the tool doesn't upload it. With LocalPDF, redaction runs in your browser, so the unredacted file never leaves your device." },
    ],
  },
  {
    slug: "password-protect-pdf",
    title: "How to Password-Protect a PDF in Your Browser",
    description:
      "Lock a PDF with a password using AES-256 encryption, choose what readers can do, and share it safely. Free, no upload, works on any device.",
    published: "2026-10-07",
    category: "How-to",
    tools: ["encrypt-pdf", "remove-password", "unlock-pdf"],
    answer:
      "To password-protect a PDF, open a PDF encryption tool, add your file, enter a strong password and choose whether readers can print or copy text, then download the protected copy. Modern PDF encryption uses AES-256, and with a local tool the password and file never leave your device.",
    body: `
## How do I add a password to a PDF?

1. Open [Protect PDF](/encrypt-pdf) and drop in your file.
2. Enter a password of at least 8 characters — longer is better.
3. Choose permissions: **Allow printing** and **Allow copying text**.
4. Click **Protect PDF** and download the encrypted copy.
5. Send the password separately from the file, for example by text message.

## What's the difference between an open password and permissions?

| Protection | What it does | How strong |
| --- | --- | --- |
| Open password | Needed to open and read the file | Strong with AES-256 and a good password |
| Permissions | Limits printing, copying or editing | A courtesy; some apps ignore it |

An open password actually encrypts the file. Permission restrictions are respected by most viewers but aren't real security on their own.

## How do I choose a strong PDF password?

- Use at least 12 characters, or a phrase of four or more random words.
- Don't reuse a password from your email or bank.
- Avoid names, birthdays and document titles.

## How do I remove a password later?

If you know the password, open [Remove password](/remove-password), enter it once and save an unlocked copy. To lift print or copy limits on a file you own, use [Remove restrictions](/unlock-pdf).

> If you forget the open password of an AES-256 PDF, there is no practical way to recover it. Keep a copy somewhere safe.
`,
    faqs: [
      { q: "Is my password sent anywhere?", a: "No. With LocalPDF the password is used only in your browser's memory to encrypt the file. It's never transmitted or stored." },
      { q: "Can I password-protect a PDF on my phone?", a: "Yes. Protect PDF works in mobile browsers on Android and iPhone." },
      { q: "Will the recipient need special software?", a: "No. Any standard PDF reader will ask for the password when they open the file." },
    ],
  },
  {
    slug: "delete-pages-from-pdf",
    title: "How to Delete Pages From a PDF (Free, No Upload)",
    description:
      "Remove blank, duplicate or unwanted pages from a PDF by clicking thumbnails or typing page ranges. Free, private and works in any browser.",
    published: "2026-10-14",
    category: "How-to",
    tools: ["delete-pages", "extract-pages", "organize-pages"],
    answer:
      "To delete pages from a PDF, open a page-removal tool, click the thumbnails of the pages you don't want (or type a range like 3-5), then save. The remaining pages keep their original quality. LocalPDF also flags blank pages so you can remove scanner leftovers in one go.",
    body: `
## How do I delete pages step by step?

1. Open [Delete pages](/delete-pages) and drop in your PDF.
2. Click each page you want to remove. Selected pages turn red.
3. Blank pages are flagged automatically — click them to remove them too.
4. Check the counter, then click **Delete selected** and download.

## Should I delete pages or extract the ones I want?

| If you want to… | Use |
| --- | --- |
| Remove a few pages from a long file | [Delete pages](/delete-pages) |
| Keep only a few pages | [Extract pages](/extract-pages) |
| Remove, reorder and rotate together | [Organize pages](/organize-pages) |

## Does deleting pages reduce file size?

Yes, usually. Removing pages removes their images and content. If the file is still large, the remaining pages may contain big images — try [Compress PDF](/compress-pdf).

## Can I undo a deletion?

Your original file is never changed; you download a new copy. In Organize pages, removed pages are marked and can be restored before you save.
`,
    faqs: [
      { q: "Can I delete pages from a password-protected PDF?", a: "Remove the password first with Remove password (you'll need to know it), then delete pages." },
      { q: "Will links and bookmarks still work?", a: "Links and bookmarks pointing to remaining pages keep working. Ones that pointed to deleted pages are removed." },
      { q: "Is there a page limit?", a: "No fixed limit. Large documents work as long as your device has enough memory." },
    ],
  },
  {
    slug: "jpg-to-pdf",
    title: "How to Convert JPG Photos to a Single PDF",
    description:
      "Turn phone photos, receipts and scans into one tidy PDF. Choose page size and margins, reorder images, and convert without uploading your pictures.",
    published: "2026-10-21",
    category: "How-to",
    tools: ["images-to-pdf", "scan-to-pdf", "compress-pdf"],
    answer:
      "To convert JPG photos into one PDF, open an images-to-PDF tool, add all your pictures, drag them into order, pick a page size like A4 and click Create PDF. Each image becomes a page. With a local converter, your photos stay on your device the whole time.",
    body: `
## How do I convert images to a PDF?

1. Open [Images to PDF](/images-to-pdf).
2. Select all your photos at once (JPG, PNG and WebP work; iPhones convert HEIC to JPG automatically when you pick them).
3. Drag them into the right order.
4. Choose a **Page size** — Fit, A4 or Letter — and a **Margin**.
5. Click **Create PDF** and download.

## Which page size should I choose?

| Option | Best for |
| --- | --- |
| Fit | Photos and screenshots; each page matches the image |
| A4 | Documents for India, Europe and most of the world |
| Letter | Documents for the US and Canada |

## How do I make phone photos of documents look like scans?

Use [Scan to PDF](/scan-to-pdf) instead. It's designed for paper documents: choose **B&W** or **Auto** to clean up shadows and make text stand out.

## Why is my PDF so big after converting photos?

Modern phone photos are often 3–5 MB each. Ten of them make a large PDF. Run the result through [Compress PDF](/compress-pdf) — photo-based PDFs usually shrink a lot.
`,
    faqs: [
      { q: "Can I convert HEIC photos from my iPhone?", a: "Yes. When you pick photos on an iPhone, iOS hands them over as JPG automatically. If you have HEIC files on a computer, convert them to JPG first." },
      { q: "Does converting reduce image quality?", a: "Images are placed in the PDF without heavy recompression, so quality stays high. Compressing afterwards trades some quality for size." },
      { q: "Are my photos uploaded?", a: "No. The conversion happens in your browser and your photos never leave your device." },
    ],
  },
];
