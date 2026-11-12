import * as React from "react";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { slugify } from "@/lib/blog";

function inline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={m.index}>{m[1]}</strong>);
    else if (m[3].startsWith("/")) out.push(<Link key={m.index} href={m[3]}>{m[2]}</Link>);
    else out.push(<a key={m.index} href={m[3]} rel="noopener noreferrer" target="_blank">{m[2]}</a>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type ListItem = { text: string; children: string[] };

/** Minimal renderer for the blog's trusted, hand-written Markdown subset. */
export function Markdown({ source }: { source: string }) {
  const lines = source.trim().split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `b${i}`;

    if (!line.trim()) {
      i++;
    } else if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      blocks.push(<h2 key={key} id={slugify(text)}>{text}</h2>);
      i++;
    } else if (line.startsWith("### ")) {
      blocks.push(<h3 key={key}>{line.slice(4).trim()}</h3>);
      i++;
    } else if (line.startsWith("> ")) {
      blocks.push(
        <div key={key} className="mt-5 flex gap-3 rounded-xl border border-border bg-primary-soft/50 px-4 py-3">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="!mt-0 text-[13.5px] leading-relaxed text-[#3f3f46]">{inline(line.slice(2).replace(/^Tip:\s*/, ""))}</p>
        </div>,
      );
      i++;
    } else if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].split("|").slice(1, -1).map((c) => c.trim());
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      blocks.push(
        <div key={key} className="mt-5 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[480px] text-left">
            <thead className="bg-canvas">
              <tr>
                {head.map((h, j) => (
                  <th key={j} className="h-9 px-4 text-[11.5px] font-medium tracking-wider text-muted-foreground uppercase">
                    {inline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className="border-t border-border">
                  {r.map((c, ci) => (
                    <td key={ci} className={ci === 0 ? "px-4 py-2.5 text-[13.5px] font-medium" : "px-4 py-2.5 text-[13.5px] text-[#3f3f46]"}>
                      {inline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    } else if (/^(- |\d+\. )/.test(line)) {
      const ordered = /^\d+\. /.test(line);
      const items: ListItem[] = [];
      while (i < lines.length && (/^(- |\d+\. )/.test(lines[i]) || /^\s{2,}- /.test(lines[i]))) {
        if (/^\s{2,}- /.test(lines[i])) items[items.length - 1]?.children.push(lines[i].trim().slice(2));
        else items.push({ text: lines[i].replace(/^(- |\d+\. )/, ""), children: [] });
        i++;
      }
      const Tag = ordered ? "ol" : "ul";
      blocks.push(
        <Tag key={key} className={ordered ? "list-decimal" : undefined}>
          {items.map((it, j) => (
            <li key={j}>
              {inline(it.text)}
              {it.children.length > 0 && (
                <ul>
                  {it.children.map((c, k) => (
                    <li key={k}>{inline(c)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </Tag>,
      );
    } else {
      const para: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(#{2,3} |> |\||- |\d+\. )/.test(lines[i])) {
        para.push(lines[i].trim());
        i++;
      }
      blocks.push(<p key={key}>{inline(para.join(" "))}</p>);
    }
  }

  return <>{blocks}</>;
}
