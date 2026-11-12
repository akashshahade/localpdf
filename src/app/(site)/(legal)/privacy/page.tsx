import type { Metadata } from "next";
import { CloudOff, EyeOff, HardDrive } from "lucide-react";
import { LegalHeader, LegalSummary } from "@/components/legal/legal-header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `${site.name} never uploads your files. Analytics measure page views only, never your documents.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="legal">
      <LegalHeader
        title="Privacy policy"
        lead={`The short version: ${site.name} never sees your files. Tools run on your device. We use analytics only to measure page visits, never documents.`}
      />
      <LegalSummary
        items={[
          { icon: CloudOff, title: "Files never uploaded", body: "Every tool runs on your device. Your documents are never sent to us or anyone else." },
          { icon: EyeOff, title: "Files stay private", body: "Analytics never see your documents, file names or anything you type into a tool." },
          { icon: HardDrive, title: "Nothing saved", body: "We keep no copies, logs or history of your files. Close the tab and they're gone." },
        ]}
      />

      <h2>1. Your files</h2>
      <p>
        When you open a file in {site.name}, it is read and processed by code running inside your browser. Your file is{" "}
        <strong>never uploaded</strong> to our servers or sent to any third party.
      </p>
      <ul>
        <li>Files are held only in your browser tab&apos;s memory while you work.</li>
        <li>Closing or refreshing the tab clears them.</li>
        <li>We cannot see, access, recover or share your files — they never reach us.</li>
      </ul>

      <h2>2. What we don&apos;t collect</h2>
      <ul>
        <li>No accounts, sign-ups, names, email addresses or passwords.</li>
        <li>No session recording or advertising networks.</li>
        <li>No marketing profiles built from your documents.</li>
        <li>We don&apos;t sell your files or tool inputs — they never reach us.</li>
      </ul>

      <h2>3. What happens when you visit</h2>
      <p>
        Like every website, the app itself — its code, styles and fonts — is delivered to your browser by our hosting
        provider. To do that, the provider&apos;s servers handle standard technical information that is part of any web
        request, such as your IP address, browser type and the page requested. This is used only to deliver the site
        and protect it from abuse. It never includes your documents, and we don&apos;t use it to identify you.
      </p>

      <h2>4. Usage statistics</h2>
      <p>
        To understand which pages are visited and how the site performs, we use Vercel Analytics, Vercel Speed Insights,
        Umami Cloud, and Google Tag Manager (container <code>GTM-M2NQNG3N</code>), which may load Google Analytics. These
        tools receive typical web request data such as page URL, browser type and approximate location. They never receive
        your files, file names, file contents, passwords or anything you type into a tool.
      </p>
      <p>
        Google and Vercel may set cookies or similar storage for this measurement. You can block them with your browser
        settings or an ad/tracker blocker.
      </p>

      <h2>5. Future AI and OCR tools</h2>
      <p>
        Upcoming tools like OCR and summaries will need a model or language data. When they launch, your browser will
        download it from our servers just like any other app file, and the model will run on your device. Your document
        will never be sent anywhere for processing.
      </p>

      <h2>6. Passwords you type into tools</h2>
      <p>
        When you add or remove a PDF password, the password is used only in your browser to encrypt or decrypt the file.
        It is never transmitted or stored.
      </p>

      <h2>7. Data stored on your device</h2>
      <p>
        {site.name} doesn&apos;t save your files or keep a history of what you&apos;ve opened. After your first visit,
        your browser caches the app&apos;s own code and pages — never your documents — so it can work without a
        connection. You can remove this at any time from your browser settings.
      </p>

      <h2>8. Children</h2>
      <p>
        Because we don&apos;t collect personal information from anyone, we don&apos;t knowingly collect information from
        children.
      </p>

      <h2>9. Check it yourself</h2>
      <p>
        You don&apos;t have to take our word for it. Open your browser&apos;s developer tools, watch the Network tab while you use a
        tool, and confirm your file is never sent. After the app has loaded, the tools keep working with your internet
        turned off.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        If anything about how {site.name} handles data changes, we&apos;ll update this page and the date at the top
        before the change takes effect.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about privacy? Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
    </div>
  );
}
