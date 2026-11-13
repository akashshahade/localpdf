import type { Metadata } from "next";
import { BadgeCheck, Lock, Scale } from "lucide-react";
import { LegalHeader, LegalSummary } from "@/components/legal/legal-header";
import { site } from "@/lib/site";

const thirdParty: [string, string, string][] = [
  ["PDF.js", "Mozilla Foundation", "Apache License 2.0"],
  ["pdf-lib (Cantoo fork)", "Andrew Dillon, Cantoo and contributors", "MIT License"],
  ["docx", "Dolan Miu", "MIT License"],
  ["Mammoth", "Michael Williamson", "BSD 2-Clause License"],
  ["fflate", "Arjun Barrett", "MIT License"],
  ["React and React DOM", "Meta Platforms, Inc. and affiliates", "MIT License"],
  ["Next.js", "Vercel, Inc.", "MIT License"],
  ["Radix UI", "WorkOS", "MIT License"],
  ["Lucide icons", "Lucide Contributors", "ISC License"],
  ["Geist font", "Vercel, Inc.", "SIL Open Font License 1.1"],
  ["Tailwind CSS", "Tailwind Labs, Inc.", "MIT License"],
  ["Sonner", "Emil Kowalski", "MIT License"],
  ["class-variance-authority", "Joe Bell", "Apache License 2.0"],
  ["clsx", "Luke Edwards", "MIT License"],
  ["tailwind-merge", "Dany Castillo", "MIT License"],
  ["tw-animate-css", "Luca Bockmann", "MIT License"],
];

export const metadata: Metadata = {
  title: "Terms of use",
  description: `The plain-language terms for using ${site.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="legal">
      <LegalHeader
        title="Terms of use"
        lead={`${site.name} is free to use. These terms explain, in plain language, what you can expect from us and what we ask of you.`}
      />
      <LegalSummary
        items={[
          { icon: BadgeCheck, title: "Free for everyone", body: "Personal and commercial use. No account, no limits, no watermark." },
          { icon: Lock, title: "Nothing uploaded", body: "Every tool runs in your browser. Your files never reach us." },
          { icon: Scale, title: "Your files, your rights", body: "You keep full ownership. We never receive your documents." },
        ]}
      />

      <h2>1. Using {site.name}</h2>
      <p>
        {site.name} is free to use for personal and commercial purposes, without an account. By using the website, you
        agree to these terms. If you don&apos;t agree, please don&apos;t use it.
      </p>

      <h2>2. Our website and content</h2>
      <p>
        The {site.name} website, name, design, code and content belong to us. You may use this website freely, but please
        don&apos;t copy, resell or republish it as your own. The source code is available on GitHub under the PolyForm
        Noncommercial License 1.0.0: personal and noncommercial use is allowed with credit; running it as a commercial
        product or service needs a paid license from us. {site.name} also uses third-party software components, each
        provided under its own license terms — see section 9.
      </p>

      <h2>3. Your files</h2>
      <ul>
        <li>You keep all rights to the documents you open. We never receive, store or claim any rights to them.</li>
        <li>Only process documents you own or are authorised to work with.</li>
        <li>Password-removal and unlock tools are for files you have the right to access.</li>
      </ul>

      <h2>4. Checking results</h2>
      <p>
        Processing happens on your device, and results depend on the input file and your device. Please keep your
        originals and review output before you rely on it — especially for legal, financial or official documents.
      </p>
      <ul>
        <li>After redacting, confirm the result with the redaction checker.</li>
        <li>OCR, summaries and other AI output can contain mistakes. Treat them as a starting point.</li>
      </ul>

      <h2>5. Acceptable use</h2>
      <p>
        Don&apos;t use {site.name} to break the law, infringe anyone&apos;s rights, or interfere with the website or
        its infrastructure.
      </p>

      <h2>6. No warranty</h2>
      <p>
        {site.name} is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind,
        express or implied, including fitness for a particular purpose and non-infringement.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we are not liable for any indirect, incidental or consequential damages,
        or for any loss of data, arising from your use of {site.name}. Because your files never reach us, we cannot
        recover them for you.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may improve, change or remove features over time. If we update these terms, we&apos;ll change the date at
        the top of this page. Continuing to use the website after that means you accept the updated terms.
      </p>

      <h2>9. Third-party software</h2>
      <p>
        {site.name} is built with the following open-source software. Each component remains the property of its
        copyright holders and is used under its own license; full license texts are available from each project.
      </p>
      <ul>
        {thirdParty.map(([name, holder, license]) => (
          <li key={name}>
            <strong>{name}</strong> — © {holder} · {license}
          </li>
        ))}
      </ul>
      <p>
        This software is provided by its authors &ldquo;as is&rdquo;, without warranty of any kind, as stated in each
        license.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
    </div>
  );
}
