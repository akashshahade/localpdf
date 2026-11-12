import type { Post } from "./types";

/** India-focused guides: Aadhaar, exam and government portals, bank statements, e-signatures. */
export const postsC: Post[] = [
  {
    slug: "compress-pdf-to-100kb-200kb-500kb",
    title: "How to Compress a PDF to 100 KB, 200 KB or 500 KB (Free, No Upload)",
    description:
      "Portals for exams, jobs, scholarships and government services often cap uploads at 100–500 KB. Here's how to hit the exact size without making your documents unreadable.",
    published: "2026-11-10",
    category: "How-to",
    tools: ["compress-pdf", "pdf-size-analyzer", "extract-pages", "images-to-pdf"],
    answer:
      "To compress a PDF to 100, 200 or 500 KB, open Compress PDF, choose Strong, turn on grayscale for black-and-white documents and download. If it's still too big, remove extra pages or rebuild the PDF from a smaller photo. One clear scanned page usually fits under 200 KB.",
    body: `
## Why do Indian portals ask for such small PDFs?

Exam, recruitment, scholarship, university and government service portals handle lakhs of uploads during peak dates. To keep them fast, they set strict limits — commonly somewhere between 50 KB and 2 MB per document. A phone scan of one certificate is often 2–5 MB, so it gets rejected.

Always check the official notification or the upload screen for the exact limit and format. Limits differ by portal and even by document on the same form.

## How do I compress a PDF to under 100 KB?

1. Open [Compress PDF](/compress-pdf) and add your file.
2. Choose **Strong**.
3. Turn on **Convert to grayscale** if the document is black and white (marksheets, certificates, ID copies).
4. Download and check the size in your file manager.

A single scanned A4 page usually lands well under 100–200 KB this way. Multi-page files may need the extra steps below.

## What size can I expect?

| Document | Typical original | After Strong + grayscale |
| --- | --- | --- |
| 1-page certificate (phone scan) | 2–4 MB | 80–200 KB |
| Aadhaar front + back | 1–3 MB | 60–150 KB |
| 3-page marksheet set | 4–8 MB | 200–500 KB |
| 10-page document with photos | 10+ MB | 1–2 MB |

These are rough ranges — the real result depends on how the file was scanned.

## What if it's still over the limit?

- **Too many pages?** Keep only the pages the portal asks for with [Extract pages](/extract-pages).
- **One huge photo inside?** Rebuild the PDF from a smaller photo with [Images to PDF](/images-to-pdf).
- **Not sure what's heavy?** [Why is my PDF big?](/pdf-size-analyzer) shows whether images, fonts or something else is taking the space.
- **Need one file per document?** [Split PDF](/split-pdf) the combined file.

## How do I make sure it's still readable?

Open the compressed PDF and zoom to 100%. Check roll numbers, dates, marks, signatures and stamps. If anything is blurry, use **Balanced** instead of Strong. A rejected or unreadable upload costs more time than a slightly bigger file.

> Your marksheets, certificates and ID copies are compressed on your own phone or laptop. Nothing is uploaded to us.
`,
    faqs: [
      { q: "Can I compress a PDF to exactly 100 KB?", a: "You can get under 100 KB for most one- or two-page scans. Compression can't target an exact number, so aim for comfortably below the limit." },
      { q: "Does this work on mobile?", a: "Yes. It runs in your phone's browser, including Chrome on Android and Safari on iPhone. No app or sign-up needed." },
      { q: "Will compression remove my photo or signature?", a: "No. Everything stays on the page. Very strong compression can soften fine details slightly, so check before you submit." },
      { q: "Is it safe for Aadhaar and marksheets?", a: "Yes. The file is processed inside your browser and never sent to a server." },
    ],
  },
  {
    slug: "merge-aadhaar-front-back-one-pdf",
    title: "How to Put Aadhaar Front and Back in One PDF (on One Page)",
    description:
      "Many forms ask for Aadhaar front and back in a single PDF or on a single page. Here's how to do it from photos or scans in under a minute — free and private.",
    published: "2026-11-08",
    category: "How-to",
    tools: ["images-to-pdf", "pages-per-sheet", "merge-pdf", "compress-pdf"],
    answer:
      "To put Aadhaar front and back in one PDF, add both photos to Images to PDF and download. To fit both sides on one page, run that PDF through Pages per sheet with 2 per sheet. Finish with Compress PDF if the form has a size limit.",
    body: `
## Why do forms want both sides in one file?

Bank KYC, SIM activation, rental agreements, admissions and many job portals allow only one upload for "address proof" or "ID proof". The front of the Aadhaar card has your photo and number; the back has your address. Putting both in one file means you don't miss either side.

## How do I make one PDF from two photos?

1. Take clear photos of the front and back on a plain, dark surface.
2. Open [Images to PDF](/images-to-pdf) and add both photos — front first.
3. Choose **A4** and a **Small** margin.
4. Click **Create PDF** and download.

You now have a two-page PDF: page 1 is the front, page 2 is the back.

## How do I put both sides on one page?

1. Open [Pages per sheet](/pages-per-sheet) and add the two-page PDF.
2. Choose **2** pages per sheet.
3. Download. Both sides now sit on a single page, which is how most offices prefer a printout.

## Already have them as two separate PDFs?

Use [Merge PDF](/merge-pdf) to join them first, then follow the one-page steps above.

## How do I keep it under the upload limit?

Run the final file through [Compress PDF](/compress-pdf) with **Strong** and **grayscale** on. Front and back on one page usually comes out at 60–150 KB.

## Should I share the full Aadhaar number?

Only if the organisation actually needs it. For most uses you can share a **masked Aadhaar** that shows just the last four digits. See [how to mask your Aadhaar number in a PDF](/blog/mask-aadhaar-number-pdf).

> Aadhaar is sensitive. Because LocalPDF runs in your browser, your card images never leave your device.
`,
    faqs: [
      { q: "Can I do this on my phone?", a: "Yes. Open the tool in your mobile browser, pick both photos from your gallery and download the PDF." },
      { q: "Will the PDF be accepted as a valid copy?", a: "It's a copy of your card, just like a photocopy. Whether it's accepted depends on the organisation. Many also accept the e-Aadhaar PDF from UIDAI." },
      { q: "Why is my PDF too big?", a: "Phone photos are large. Use Compress PDF with Strong and grayscale to bring it down to a few hundred KB or less." },
    ],
  },
  {
    slug: "e-aadhaar-pdf-password",
    title: "e-Aadhaar PDF Password: What It Is and How to Remove It",
    description:
      "Downloaded your e-Aadhaar and it's asking for a password? Here's the password format UIDAI uses, how to open the file, and how to save an unlocked copy safely.",
    published: "2026-11-06",
    category: "How-to",
    tools: ["remove-password", "compress-pdf", "encrypt-pdf"],
    answer:
      "The e-Aadhaar PDF password is the first four letters of your name in capital letters followed by your year of birth, for example SURE1990 for Suresh born in 1990. Enter it to open the file. To save a copy without a password, use Remove password with the same password.",
    body: `
## What is the e-Aadhaar password?

UIDAI protects every downloaded e-Aadhaar PDF with a password made of two parts:

1. The **first four letters of your name** as printed on Aadhaar, in **CAPITAL letters**.
2. Your **year of birth** in **YYYY** format.

| Name on Aadhaar | Year of birth | Password |
| --- | --- | --- |
| Suresh Kumar | 1990 | SURE1990 |
| Priya Shah | 2001 | PRIY2001 |

If your name has initials, dots or is very short, check UIDAI's official help page for the exact rule.

## How do I remove the password from e-Aadhaar?

You need the password — this is for your own document, not for bypassing protection.

1. Open [Remove password](/remove-password) and add the e-Aadhaar PDF.
2. Type the password (for example SURE1990).
3. Click **Unlock PDF** and download the unlocked copy.

Many upload portals reject password-protected files, so the unlocked copy is what you'll usually submit.

## Is it safe to remove the password?

The password protects your Aadhaar if the file is lost or forwarded. Keep the unlocked copy only as long as you need it, and don't leave it in shared folders or chats. If you need to send it by email, add your own password back with [Protect PDF](/encrypt-pdf) and share the password separately.

## The file is too big for the portal — what now?

Run the unlocked PDF through [Compress PDF](/compress-pdf). e-Aadhaar PDFs are usually small already, but this helps when a portal has a tight limit.

> Unlocking happens entirely in your browser. Your Aadhaar file and password are never sent to any server.
`,
    faqs: [
      { q: "Why is my e-Aadhaar password not working?", a: "Check that you used capital letters, the name exactly as printed on Aadhaar, and the full four-digit year of birth. Then check UIDAI's help page for special cases." },
      { q: "Can I open e-Aadhaar without the password?", a: "No. The password is required to open the file. LocalPDF doesn't break passwords — it only removes one you already know." },
      { q: "Is the unlocked e-Aadhaar still valid?", a: "Removing the open password doesn't change the content. Whether a copy is accepted depends on the organisation you submit it to." },
    ],
  },
  {
    slug: "mask-aadhaar-number-pdf",
    title: "How to Mask Your Aadhaar Number in a PDF Before Sharing",
    description:
      "Hotels, landlords and offices often ask for an Aadhaar copy. Share a masked version that hides the first 8 digits — here's how to do it properly, not just cover it.",
    published: "2026-11-04",
    category: "Privacy",
    tools: ["redact-pdf", "auto-redact-pii", "redaction-checker"],
    answer:
      "To mask your Aadhaar number in a PDF, open Redact PDF, drag a box over the first eight digits on every page where the number appears, and apply redactions. The digits are permanently removed, leaving only the last four visible. Run Redaction checker afterwards to confirm nothing is hidden underneath.",
    body: `
## What is a masked Aadhaar?

A masked Aadhaar shows only the **last four digits** of the number — the first eight are replaced with X's or blacked out. UIDAI encourages using masked Aadhaar where the full number isn't required, such as hotel check-ins and many KYC copies. You can also download a masked e-Aadhaar directly from UIDAI.

## Why not just draw a black box over it?

A black box drawn in an ordinary PDF editor only **covers** the number. The digits are often still in the file and can be copied or revealed by removing the box. Real redaction **deletes** what's underneath.

## How do I mask Aadhaar in a PDF?

1. Open [Redact PDF](/redact-pdf) and add your Aadhaar PDF or scan.
2. Choose **Redact area** and drag over the first eight digits.
3. Repeat on every place the number appears — front, back and any QR area you want to hide.
4. Click **Apply redactions** and download.

## Can it find the number automatically?

For digital PDFs (like e-Aadhaar), [Auto-redact PII](/auto-redact-pii) can find Aadhaar and PAN numbers, phone numbers and emails using pattern matching, and redact them in one go. Review the result — it removes the whole number, so use manual redaction if you want to keep the last four digits.

Scanned photos have no text layer, so mark those areas by hand.

## How do I check the masking worked?

Open the result in [Redaction checker](/redaction-checker). It looks for text still hiding under black boxes and tells you if anything is left.

## What else should I mask?

| Field | Mask it? |
| --- | --- |
| First 8 digits of Aadhaar | Yes, unless full number is required |
| Date of birth | If not needed |
| Address (back side) | If only identity proof is needed |
| Photo | Usually keep — it proves identity |

> Masking happens on your device. Your Aadhaar never leaves your browser.
`,
    faqs: [
      { q: "Is a masked Aadhaar valid?", a: "Masked Aadhaar is accepted for many purposes where the full number isn't required. Some services, like certain banking or government processes, may still need the full number." },
      { q: "Can someone undo the redaction?", a: "No. Redact PDF removes the content and rebuilds the affected page, so the hidden digits are gone from the file." },
      { q: "Does this work on PAN cards too?", a: "Yes. The same steps work for PAN, passport, voter ID and bank documents." },
    ],
  },
  {
    slug: "sign-pdf-online-india-legal",
    title: "Is an Electronic Signature on a PDF Valid in India?",
    description:
      "Offer letters, NDAs, rent forms and consent letters are increasingly signed as PDFs. Here's what Indian law says, when a typed or drawn signature is enough, and when you need Aadhaar eSign or a DSC.",
    published: "2026-11-02",
    category: "Guides",
    tools: ["sign-pdf", "edit-pdf", "file-fingerprint", "encrypt-pdf"],
    answer:
      "Electronic signatures are recognised in India under the Information Technology Act, 2000. A typed or drawn signature on a PDF is widely used for offer letters, NDAs and everyday consent, but some filings need Aadhaar eSign or a Digital Signature Certificate, and documents like wills and property sale deeds are excluded.",
    body: `
## What does Indian law say about e-signatures?

The **Information Technology Act, 2000** gives legal recognition to electronic records and electronic signatures. In practice, there are three common kinds:

| Type | What it is | Typical use |
| --- | --- | --- |
| Simple e-signature | Typed or drawn signature placed on a PDF | Offer letters, NDAs, internal approvals, consent forms |
| Aadhaar eSign | OTP-based signature through a licensed eSign provider | Agreements and forms needing stronger proof of identity |
| Digital Signature Certificate (DSC) | Certificate-based signature on a USB token | MCA, GST and income-tax filings, tenders |

> This is general information, not legal advice. For important contracts, check with a lawyer.

## When is a typed or drawn signature enough?

For most day-to-day documents — accepting a job offer, signing an NDA, a school consent form or an internal approval — a simple e-signature is widely accepted, especially when both sides agree to sign electronically and keep the emails or messages as a record.

## When do I need Aadhaar eSign or a DSC?

- Government and statutory filings that specifically ask for one.
- Contracts where the other party requires stronger identity proof.
- Company and tax filings that only accept a DSC.

## Which documents can't be signed electronically?

The IT Act excludes some documents, including **wills**, **powers of attorney**, **trusts**, **contracts for sale or conveyance of immovable property**, and **negotiable instruments other than cheques**. These still need traditional signatures and, often, stamp paper and registration.

## How do I sign a PDF for free?

1. Open [Sign PDF](/sign-pdf) and add your document.
2. Choose **Signature**, then type your name or **Draw** it with your finger or mouse.
3. Click where you want to sign. Drag to move it, drag the corner to resize.
4. Add a date with **Text** if needed, then click **Apply signature**.

## How do I prove the PDF wasn't changed later?

Create a fingerprint with [File fingerprint](/file-fingerprint) right after signing and share it with the other party. If even one character changes, the fingerprint changes. You can also protect the file with [Protect PDF](/encrypt-pdf).

> Your signature is created and placed in your browser. It's never uploaded or stored by us.
`,
    faqs: [
      { q: "Is a drawn signature the same as a digital signature?", a: "No. A drawn or typed signature is a simple electronic signature. A digital signature uses a certificate (DSC) or Aadhaar eSign to cryptographically prove identity." },
      { q: "Can I sign a rent agreement as a PDF?", a: "Many rent agreements need stamp duty, and some need registration depending on the state and duration. Check local rules — an e-signature alone may not be enough." },
      { q: "Is my signature saved anywhere?", a: "No. It exists only in your browser tab while you work and disappears when you close it." },
    ],
  },
  {
    slug: "government-exam-form-documents-pdf",
    title: "Preparing Documents for Government Exam Forms: A PDF Checklist",
    description:
      "Applying through UPSC, SSC, IBPS, NTA or state PSC portals? Get your certificates, caste and income proofs, and ID scans in the right PDF format and size the first time.",
    published: "2026-10-31",
    category: "Guides",
    tools: ["images-to-pdf", "compress-pdf", "merge-pdf", "rotate-pdf", "crop-pdf"],
    answer:
      "For government exam forms, scan each certificate clearly, convert photos to PDF, rotate and crop pages so they're straight, merge only when the portal wants one file, then compress to the size in the official notification. Always follow the notification — formats and size limits differ by exam and year.",
    body: `
## What documents are usually asked for?

Each notification has its own list, but these come up often:

- Class 10 and 12 marksheets and certificates
- Graduation degree or provisional certificate
- Category certificate (SC/ST/OBC-NCL/EWS) and income certificate
- Domicile or residence certificate
- Disability certificate, if applicable
- Photo ID such as Aadhaar, PAN, voter ID or passport
- Experience or NOC letters for working candidates

Photo and signature uploads are usually separate **JPG** files with their own pixel and KB limits — read those rules carefully.

## How do I turn phone photos into clean PDFs?

1. Photograph each page flat, in good light, with no shadows.
2. Add the photos to [Images to PDF](/images-to-pdf) — one image per page.
3. Fix sideways pages with [Rotate PDF](/rotate-pdf) and trim edges with [Crop PDF](/crop-pdf).

## One file or separate files?

| Portal asks for | Do this |
| --- | --- |
| Separate upload per certificate | One PDF per document |
| One combined file | [Merge PDF](/merge-pdf) in the order listed in the notification |
| "Self-attested" copies | Sign each page before scanning, or use [Sign PDF](/sign-pdf) if digital copies are allowed |

## How do I meet the size limit?

Use [Compress PDF](/compress-pdf) with **Strong** and **grayscale** for black-and-white documents. See our guide on [compressing to 100, 200 or 500 KB](/blog/compress-pdf-to-100kb-200kb-500kb) for exact steps.

## Final checks before you submit

- Every page is upright, readable and complete — no cut-off edges.
- File names are clear (for example, class10-marksheet.pdf).
- Sizes are below the limit with some margin.
- No password on the files — portals usually can't open protected PDFs. Remove it with [Remove password](/remove-password).

> Keep a folder of ready-made PDFs. Most of these documents are asked for again in the next exam cycle.
`,
    faqs: [
      { q: "What is the size limit for documents on exam portals?", a: "It differs by exam and by year. Always use the limit given in the official notification or on the upload screen." },
      { q: "Can I upload a photo instead of a PDF?", a: "Only if the portal allows it. If it asks for PDF, convert the photo with Images to PDF first." },
      { q: "Are my certificates uploaded to LocalPDF?", a: "No. Everything is converted and compressed in your browser. Only you upload the final file to the official portal." },
    ],
  },
  {
    slug: "bank-statement-pdf-loan-visa",
    title: "Bank Statement PDF for Loan or Visa: Unlock, Merge and Compress",
    description:
      "Lenders, embassies and landlords ask for 3–12 months of bank statements as one PDF. Here's how to unlock, combine, trim and shrink your statements without sharing them with another website.",
    published: "2026-10-29",
    category: "How-to",
    tools: ["remove-password", "merge-pdf", "extract-pages", "compress-pdf", "redact-pdf"],
    answer:
      "To prepare bank statements for a loan or visa, remove the password with the one your bank gave you, merge the months in date order with Merge PDF, remove unneeded pages with Extract pages, and compress the result. Never send statements through an online tool that uploads them.",
    body: `
## Why are bank statement PDFs password protected?

Banks protect e-statements so only you can open them. The password format is usually explained in the email the statement came with — often a combination of details like your name, date of birth or customer ID. Check that email or your bank's website for the exact format.

## How do I remove the password?

1. Open [Remove password](/remove-password) and add the statement.
2. Enter the password your bank gave you.
3. Click **Unlock PDF** and download.

Repeat for each month. Most loan and visa portals can't open protected files, so unlocked copies avoid rejections.

## How do I combine 6 or 12 months into one PDF?

1. Open [Merge PDF](/merge-pdf) and add all the unlocked statements.
2. Drag them into date order — oldest first is the usual convention.
3. Click **Merge** and download one combined statement.

## How do I remove pages I don't need?

Statements often end with pages of terms, offers or blank sheets. Use [Extract pages](/extract-pages) to keep only the transaction pages, or [Delete pages](/delete-pages) to drop the extras.

## How do I keep it under the upload size?

Run the merged file through [Compress PDF](/compress-pdf). Bank statements are mostly text, so they compress well and stay sharp.

## Should I hide anything?

Only if the recipient doesn't need it. For a rental application, for example, you might hide unrelated transactions or account numbers with [Redact PDF](/redact-pdf). For loans and visas, send complete statements — edited statements can be rejected.

| Use | Send |
| --- | --- |
| Home or personal loan | Complete, unedited statements for the period asked |
| Visa application | Complete statements, often with bank seal or as instructed |
| Rental application | Summary pages; consider redacting unrelated details |

> Bank statements reveal a lot about you. LocalPDF processes them in your browser — nothing is uploaded.
`,
    faqs: [
      { q: "What's my bank statement password?", a: "Each bank uses its own format, usually explained in the statement email or on the bank's website. LocalPDF can't guess or break passwords." },
      { q: "Is a merged PDF accepted for a visa?", a: "Usually yes, if all pages are complete and unedited. Some embassies want stamped statements from the branch — always follow their checklist." },
      { q: "Can I do this on my phone?", a: "Yes. All the tools work in mobile browsers without installing an app." },
    ],
  },
  {
    slug: "is-it-safe-to-upload-aadhaar-pan-online-pdf-tools",
    title: "Is It Safe to Upload Aadhaar or PAN to Online PDF Tools?",
    description:
      "Most free PDF websites upload your files to their servers. Here's what that means for Aadhaar, PAN and bank documents, what India's DPDP Act changes, and how to check a tool is truly local.",
    published: "2026-10-27",
    category: "Privacy",
    tools: ["compress-pdf", "merge-pdf", "redact-pdf", "remove-password"],
    answer:
      "Uploading Aadhaar, PAN or bank documents to an online PDF tool means a copy sits on someone else's server, at least for a while. It's safer to use a tool that processes files inside your browser. You can check by turning off Wi-Fi after the page loads — a local tool keeps working.",
    body: `
## What happens when I upload to a PDF website?

Most popular PDF sites send your file to their servers, process it there and let you download the result. Many promise to delete files after an hour or so. That may be true, but your document still travels over the internet and is stored, even briefly, on a computer you don't control — sometimes in another country.

For a recipe or a brochure, that's fine. For **Aadhaar, PAN, passport, marksheets, salary slips or bank statements**, it's a real risk if the service is breached, misconfigured or careless.

## What does India's DPDP Act mean here?

The **Digital Personal Data Protection Act, 2023** sets rules for how organisations handle personal data and gives people rights over their data. It's a step forward, but it can't undo a leak after it happens. The safest data is data that never leaves your device.

## How is a local PDF tool different?

| | Upload-based tool | LocalPDF (in-browser) |
| --- | --- | --- |
| Where your file goes | Their server | Stays on your device |
| Works offline | No | Yes, after the page loads |
| Account needed | Often, for bigger files | Never |
| Copies kept | Usually "deleted after X hours" | None — nothing is sent |

## How can I check a tool is really local?

1. Open the tool and let the page load.
2. Turn off Wi-Fi or mobile data.
3. Add your file and run the tool.

If it still works, your file is being processed on your device. You can also watch the **Network** tab in your browser's developer tools — no file upload should appear.

## Good habits for sensitive documents

- Share a **masked Aadhaar** when the full number isn't needed — see [how to mask Aadhaar in a PDF](/blog/mask-aadhaar-number-pdf).
- Remove passwords only when a portal requires it, and delete unlocked copies afterwards.
- Don't forward ID scans on chat apps unless you have to.
- Prefer official portals such as DigiLocker for storing and sharing documents where accepted.

> LocalPDF is free and runs entirely in your browser — so you can [compress](/compress-pdf), [merge](/merge-pdf) and [redact](/redact-pdf) sensitive documents without sending them anywhere.
`,
    faqs: [
      { q: "Do popular PDF sites keep my files?", a: "Most upload your files and say they delete them after a set time. Check each site's privacy policy. A local tool avoids the question entirely." },
      { q: "Does LocalPDF see my Aadhaar?", a: "No. The file is opened and processed by code running in your browser. It is never uploaded to us or anyone else." },
      { q: "Is it safe on public Wi-Fi?", a: "Since the file never leaves your device, public Wi-Fi doesn't expose it. Still, avoid leaving sensitive downloads on shared computers." },
    ],
  },
];
