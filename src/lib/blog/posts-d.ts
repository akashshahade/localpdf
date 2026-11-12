import type { Post } from "./types";

/** Photo & signature guides for Indian online forms. */
export const postsD: Post[] = [
  {
    slug: "resize-photo-to-20kb-50kb",
    title: "How to Resize a Photo to 20 KB or 50 KB for Online Forms (Free)",
    description:
      "Exam, job and government portals reject photos that are too big. Here's how to shrink a photo or signature under 10, 20, 50 or 100 KB on your phone — free, and without uploading it.",
    published: "2026-11-12",
    category: "How-to",
    tools: ["resize-image-to-kb", "exam-photo-signature-resizer", "resize-image"],
    answer:
      "To resize a photo to 20 KB or 50 KB, open Resize image to KB, add your photo, pick the size limit and click Resize. The tool lowers the JPG quality step by step until the file fits, and only shrinks the picture if it has to. It runs on your phone, so nothing is uploaded.",
    body: `
## Why do forms reject my photo?

Phone cameras take 2–5 MB photos. Most Indian exam, job, scholarship and government portals accept only small JPG files — often between 10 KB and 100 KB for a photo, and even less for a signature. Anything bigger is rejected at upload.

## How do I resize a photo to a specific KB?

1. Open [Resize image to KB](/resize-image-to-kb).
2. Add your photo — you can add several at once.
3. Choose **10**, **20**, **50**, **100** or **200 KB**, or type any size (for example 35).
4. Click **Resize** and download the JPG.

The result screen shows the final size and pixel dimensions, so you can check it before uploading.

## What if the form also has a minimum size?

Some forms say "between 20 KB and 50 KB". If your file comes out too small, use the [exam presets](/exam-photo-signature-resizer) — they handle both the minimum and maximum for popular forms.

## What if the form asks for exact pixels or cm?

Use [Resize image](/resize-image) to set width and height in pixels, cm, mm or inches, then run the result through Resize image to KB if needed.

| Form says | Use |
| --- | --- |
| "Max 50 KB" | [Resize image to KB](/resize-image-to-kb) |
| "200 × 230 pixels" | [Resize image](/resize-image) |
| "3.5 cm × 4.5 cm" | [Passport size photo](/passport-size-photo) or [Resize image](/resize-image) |
| "SSC / IBPS / UPSC / NTA / PAN" | [Exam presets](/exam-photo-signature-resizer) |

## Will my photo look blurry?

At 20–50 KB a passport-style photo still looks sharp, because forms only need a small image. Very large photos are first scaled to a sensible size, then compressed. If you need it sharper, choose a bigger limit if the form allows it.

> Your photos are resized on your own device. They are never uploaded to us.
`,
    faqs: [
      { q: "Can I resize a photo to exactly 20 KB?", a: "The tool gets as close as possible while staying under your limit, usually within a few KB of it. Forms only care that the file is under the maximum." },
      { q: "Does it work on Android and iPhone?", a: "Yes. It runs in your phone's browser with no app to install." },
      { q: "Which format should I use?", a: "Almost all Indian portals ask for JPG/JPEG. The tool always saves as JPG." },
      { q: "Is it safe for my photo and signature?", a: "Yes. The photo is processed in your browser and never sent to a server." },
    ],
  },
  {
    slug: "passport-size-photo-35x45mm",
    title: "How to Make a Passport Size Photo (35×45 mm) at Home — Free",
    description:
      "Make a 35×45 mm passport size photo from any picture, at 300 DPI, ready to upload or print 8 copies on a 4×6 sheet. Tips for background, lighting and printing.",
    published: "2026-11-12",
    category: "How-to",
    tools: ["passport-size-photo", "resize-image-to-kb", "resize-image"],
    answer:
      "To make a passport size photo at home, take a well-lit photo against a plain white wall, open Passport size photo, choose 35×45 mm and click Make photo. For printing, choose the 4×6 sheet to get 8 copies, then print at actual size and cut along the guide lines.",
    body: `
## What size is a passport size photo in India?

The standard Indian passport size photo is **35 mm × 45 mm** (3.5 × 4.5 cm). At 300 DPI that's **413 × 531 pixels**. US visas use **2 × 2 inches** (51 × 51 mm) instead.

## How do I take a good photo at home?

- Stand in front of a plain white or light wall.
- Face a window for soft, even light — avoid harsh shadows.
- Look straight at the camera, neutral expression, eyes open.
- Keep your head and the top of your shoulders in the frame, with a little space above your head.
- Remove caps and dark glasses.

## How do I make the passport photo?

1. Open [Passport size photo](/passport-size-photo) and add your picture.
2. Choose **35×45 mm** (or 2×2 in for a US visa).
3. Choose **One photo** to upload online, or a **4×6** or **A4** sheet to print.
4. Click **Make photo** and download.

## How do I print it?

| Sheet | Copies (35×45 mm) | How to print |
| --- | --- | --- |
| 4×6 inch | 8 | Any photo shop or home photo printer |
| A4 | about 30 | Home printer on photo paper |

Print at **100% / actual size** — don't use "fit to page" — then cut along the grey lines.

## The form asks for a KB limit too

Choose a maximum size in KB in the settings, or run the photo through [Resize image to KB](/resize-image-to-kb).

> For official passport applications, the Passport Seva photo rules apply. Check the latest guidelines before you submit.
`,
    faqs: [
      { q: "What is 35×45 mm in pixels?", a: "At 300 DPI it's 413 × 531 pixels. At 200 DPI it's 276 × 354 pixels." },
      { q: "Can I change the background to white?", a: "Not yet — take the photo against a plain white wall for the best result. Automatic background removal is planned." },
      { q: "Is 3.5×4.5 cm the same as 35×45 mm?", a: "Yes. 3.5 × 4.5 cm and 35 × 45 mm are the same size." },
    ],
  },
  {
    slug: "photo-signature-size-ssc-upsc-ibps-neet-pan",
    title: "Photo and Signature Size for SSC, UPSC, IBPS, NEET and PAN (Guide)",
    description:
      "Typical photo and signature sizes in pixels and KB for SSC, UPSC, IBPS, NTA (NEET, JEE, CUET) and PAN applications — and a one-tap way to resize yours on your phone.",
    published: "2026-11-11",
    category: "Guides",
    tools: ["exam-photo-signature-resizer", "resize-image-to-kb", "signature-cleaner", "name-date-on-photo"],
    answer:
      "Most Indian exam forms ask for a JPG photo of roughly 20–50 KB and a signature of 10–20 KB, at fixed pixel sizes. UPSC allows larger files and asks for your name and photo date on the photo. Use the exam presets to resize in one tap, and always confirm the numbers in the official notice.",
    body: `
## Typical sizes at a glance

These are the commonly published requirements. Notices change between years and posts, so **always check the official notification** before you upload.

| Form | Photo | Signature |
| --- | --- | --- |
| SSC | JPG, 20–50 KB, about 3.5 × 4.5 cm | JPG, 10–20 KB, about 4 × 2 cm |
| UPSC | JPG, 20–300 KB, 350–1000 px each side, name and date on photo | JPG, 20–300 KB, 350–1000 px each side |
| IBPS / SBI | JPG, 20–50 KB, 200 × 230 px | JPG, 10–20 KB, 140 × 60 px |
| NTA (NEET, JEE, CUET) | JPG, 10–200 KB, passport size | JPG, 4–30 KB |
| PAN (NSDL/UTIITSL) | 3.5 × 2.5 cm at 200 DPI, up to 50 KB | 2 × 4.5 cm at 200 DPI, up to 50 KB |

## How do I resize for a specific exam?

1. Open the [exam photo & signature resizer](/exam-photo-signature-resizer).
2. Pick the form: **SSC**, **UPSC**, **IBPS**, **NTA** or **PAN**.
3. Choose **Photo** or **Signature** and add the image.
4. For UPSC, type your name so it's printed with the date under the photo.
5. Click **Resize** and download.

The result shows the exact pixels and KB, so you can compare them with the notice.

## My signature photo looks grey or shadowy

Run it through [Clean up signature](/signature-cleaner) first. It removes shadows and paper texture and crops to your signature. Then use the exam preset.

## Common reasons for rejection

- File too big or too small for the KB range.
- Wrong format — PNG or HEIC instead of JPG.
- Photo too dark, blurry or with a busy background.
- Signature in capital letters, or not your full signature.
- Missing name and date on the photo when the form asks for it — use [Name & date on photo](/name-date-on-photo).
`,
    faqs: [
      { q: "Are these sizes official?", a: "They're the commonly published sizes, but each notification can change them. Treat this as a starting point and follow the official notice." },
      { q: "Is my photo uploaded to LocalPDF?", a: "No. Resizing happens in your browser. You upload the final file only to the official portal." },
      { q: "What if my exam isn't listed?", a: "Use Resize image for exact pixels or cm, then Resize image to KB for the file size." },
    ],
  },
  {
    slug: "signature-on-white-background",
    title: "How to Get a Clean Signature on a White Background From Your Phone",
    description:
      "Sign on paper, take a photo and turn it into a crisp black or blue signature on pure white — or a transparent PNG for documents. Free and private.",
    published: "2026-11-10",
    category: "How-to",
    tools: ["signature-cleaner", "exam-photo-signature-resizer", "sign-pdf"],
    answer:
      "To get a clean signature, sign with a dark pen on plain white paper, take a well-lit photo, then open Clean up signature. It removes shadows and paper texture, makes the ink crisp, crops to your signature and saves a white JPG or a transparent PNG.",
    body: `
## How do I photograph my signature?

- Use a **black or dark blue** pen on **plain white** paper.
- Sign a little larger than usual.
- Take the photo in daylight, from directly above, without your shadow on the paper.

## How do I clean it up?

1. Open [Clean up signature](/signature-cleaner) and add the photo.
2. Pick **Black** or **Blue** ink.
3. Choose **White (JPG)** for forms, or **Transparent (PNG)** to place on documents.
4. Click **Clean signature** and download.

If thin strokes disappear, raise **Ink pickup**. If grey patches remain, lower it.

## Using the signature

| Where | Next step |
| --- | --- |
| Exam or job form | [Exam presets](/exam-photo-signature-resizer) or [Resize image to KB](/resize-image-to-kb) |
| Sign a PDF | [Sign PDF](/sign-pdf) — draw or type, or add your image with Edit PDF |
| One image with your photo | [Join photo & signature](/join-photo-signature) |

> Your signature is processed only on your device. It's never uploaded or stored.
`,
    faqs: [
      { q: "Why is my signature grey instead of black?", a: "Uneven light makes ink look grey. Clean up signature corrects the lighting; raise Ink pickup if strokes are still faint." },
      { q: "Can I get a transparent signature PNG?", a: "Yes. Choose Transparent (PNG) as the background." },
      { q: "Is it safe to process my signature online?", a: "With LocalPDF the signature never leaves your phone or computer — it isn't uploaded anywhere." },
    ],
  },
  {
    slug: "upsc-photo-name-date",
    title: "How to Add Name and Date on Your Photo for UPSC",
    description:
      "UPSC asks for the candidate's name and the date the photo was taken on the photograph. Add them neatly in a white strip below your photo — free, on your phone.",
    published: "2026-11-09",
    category: "How-to",
    tools: ["name-date-on-photo", "exam-photo-signature-resizer", "resize-image-to-kb"],
    answer:
      "To add your name and date on a photo for UPSC, open Name & date on photo, add a recent photo, type your name and the date it was taken, and click Add name & date. The tool adds a clean white strip with both under the photo. Then check the size limit in the notice.",
    body: `
## What does UPSC ask for?

UPSC's recent notices ask that the photograph show the **candidate's name** and the **date the photo was taken**, and that the photo is recent. Check the current notice for the exact wording and size limits.

## How do I add name and date?

1. Open [Name & date on photo](/name-date-on-photo) and add your photo.
2. Type your name as on your application.
3. Type the date the photo was taken (DD/MM/YYYY). If you leave it empty, today's date is used.
4. Click **Add name & date** and download.

## How do I meet the size limit?

Use the [UPSC preset](/exam-photo-signature-resizer) — it resizes the photo, adds your name and date, and keeps the file in the usual KB range in one step. Or set a maximum KB in the settings here.

## Tips

- Use a clear, front-facing photo with a light background.
- Make sure the date is the actual date of the photo, not the form date.
- Keep a copy — you may need the same photo at later stages.
`,
    faqs: [
      { q: "Does the name have to be in capital letters?", a: "The tool prints it in capitals for clarity. Follow the notice if it says otherwise." },
      { q: "Will this work for other exams?", a: "Yes. Any form that asks for name and date on the photo works the same way." },
      { q: "Is my photo uploaded?", a: "No. It's processed in your browser and never leaves your device." },
    ],
  },
  {
    slug: "image-size-pixels-cm-dpi",
    title: "Pixels, CM and DPI Explained: Resize an Image for Any Form",
    description:
      "Forms ask for sizes in pixels, cm, mm or inches. Learn how they relate through DPI, convert between them, and resize your image exactly — free and offline.",
    published: "2026-11-08",
    category: "Guides",
    tools: ["resize-image", "passport-size-photo", "resize-image-to-kb"],
    answer:
      "Pixels measure an image on screen; cm, mm and inches measure it on paper. DPI (dots per inch) links them: pixels = inches × DPI. A 3.5 × 4.5 cm photo at 300 DPI is 413 × 531 pixels. Use Resize image to set the exact size in any unit.",
    body: `
## How do pixels and cm relate?

**Pixels = inches × DPI**, and 1 inch = 2.54 cm. So at 300 DPI, 1 cm ≈ 118 pixels.

| Size | 200 DPI | 300 DPI |
| --- | --- | --- |
| 3.5 × 4.5 cm | 276 × 354 px | 413 × 531 px |
| 2 × 2 inch | 400 × 400 px | 600 × 600 px |
| 4 × 2 cm | 315 × 157 px | 472 × 236 px |

## Which DPI should I use?

- **300 DPI** for printing photos.
- **200 DPI** when a form says so (PAN does, for example).
- For online-only forms, the pixel size and KB matter more than DPI.

## How do I resize to an exact size?

1. Open [Resize image](/resize-image).
2. Enter width and height and choose the unit: px, cm, mm or inch.
3. Choose the DPI.
4. Choose what happens if the shape differs: **Crop**, **Fit** or **Stretch**.
5. Click **Resize** and download as JPG or PNG.

Leave height empty to keep the original shape.

## Then fit the KB limit

If the form also has a KB limit, finish with [Resize image to KB](/resize-image-to-kb).
`,
    faqs: [
      { q: "Does changing DPI change the file size?", a: "Not by itself. DPI is stored as a label; the pixel size and JPG quality decide the KB." },
      { q: "Crop or Fit — which should I choose?", a: "Crop fills the whole size and trims edges — best for photos. Fit keeps everything and adds white bars — best for signatures and documents." },
      { q: "Is it free?", a: "Yes, free with no sign-up and no watermark, and your images never leave your device." },
    ],
  },
];
