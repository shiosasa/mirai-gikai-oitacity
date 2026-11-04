export type MarkdownSection = { key: string; heading: string; body: string };

export function splitMarkdownSections(markdown: string): MarkdownSection[] {
  const sections: MarkdownSection[] = [{ key: "intro", heading: "", body: "" }];
  const headingCounts = new Map<string, number>();
  let fence: { marker: string; length: number } | null = null;
  for (const line of markdown.split(/(?<=\n)/)) {
    const match = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (match) {
      if (!fence) fence = { marker: match[1][0], length: match[1].length };
      else if (
        match[1][0] === fence.marker &&
        match[1].length >= fence.length &&
        line.slice(match[0].length).trim() === ""
      )
        fence = null;
      sections[sections.length - 1].body += line;
    } else if (!fence && /^##\s+\S/.test(line)) {
      const occurrence = (headingCounts.get(line) ?? 0) + 1;
      headingCounts.set(line, occurrence);
      sections.push({ key: `${line}-${occurrence}`, heading: line, body: "" });
    } else {
      sections[sections.length - 1].body += line;
    }
  }
  return sections;
}

export function joinMarkdownSections(sections: MarkdownSection[]): string {
  return sections
    .map((section, index) => {
      const text = section.heading + section.body;
      return index < sections.length - 1 && text && !text.endsWith("\n")
        ? `${text}\n\n`
        : text;
    })
    .join("");
}
