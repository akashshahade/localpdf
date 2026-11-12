import type { Metadata } from "next";
import { Lock, ServerOff, ShieldCheck } from "lucide-react";
import { LegalHeader, LegalSummary } from "@/components/legal/legal-header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security",
  description: `How ${site.name} keeps your documents safe, and how to report a vulnerability.`,
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <div className="legal">
      <LegalHeader
        title="Security"
        lead="The safest place for a sensitive document is the device it's already on. That's why we built LocalPDF so your files never leave it."
      />
      <LegalSummary
        items={[
          { icon: ServerOff, title: "No server copies", body: "Files are never uploaded, so there's no server copy to leak or breach." },
          { icon: Lock, title: "No accounts", body: "No passwords or personal data stored, so nothing to steal." },
          { icon: ShieldCheck, title: "Open and auditable", body: "Anyone can review the code that handles your files." },
        ]}
      />

      <h2>How it&apos;s built</h2>
      <ul>
        <li>All processing runs inside your browser&apos;s sandbox, on your device.</li>
        <li>There is no server-side file processing, no document storage and no user database.</li>
        <li>The app is served over HTTPS from our own domain.</li>
        <li>No advertising or session recording. Optional analytics (Vercel and Google Tag Manager) measure page views only — never your files.</li>
        <li>Processing libraries ship with the app instead of loading from outside sources at runtime.</li>
      </ul>

      <h2>Passwords in PDF tools</h2>
      <p>
        When you protect or unlock a PDF, your password is used only in memory in your browser to encrypt or decrypt the
        file. It is never transmitted, logged or saved.
      </p>

      <h2>Verify it yourself</h2>
      <ul>
        <li>Open your browser&apos;s developer tools and watch the Network tab while you use a tool.</li>
        <li>Load the app, turn off your internet connection, and keep working.</li>
      </ul>

      <h2>Tips for sensitive documents</h2>
      <ul>
        <li>Keep your original file until you&apos;ve checked the result.</li>
        <li>After redacting, run the redaction checker to make sure nothing is still hidden underneath.</li>
        <li>On a shared computer, close the tab when you&apos;re done.</li>
      </ul>

      <h2>Reporting a vulnerability</h2>
      <p>
        If you believe you&apos;ve found a security issue, please email{" "}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> with a description, the steps to reproduce it
        and the browser you used. Please give us reasonable time to fix it before sharing details publicly.
      </p>
      <p>
        We welcome good-faith security research and won&apos;t pursue action against researchers who report issues
        responsibly.
      </p>
    </div>
  );
}
