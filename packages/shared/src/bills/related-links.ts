export type RelatedLink = { label: string; url: string };

export function getRelatedLinks(article: {
  related_links?: unknown;
  link_label?: string | null;
  link_url?: string | null;
}): RelatedLink[] {
  if (article.related_links == null) {
    return article.link_url
      ? [{ label: article.link_label ?? "", url: article.link_url }]
      : [];
  }
  if (!Array.isArray(article.related_links)) {
    throw new Error("Related links must be an array");
  }
  return article.related_links.map((link: unknown) => {
    if (
      !link ||
      typeof link !== "object" ||
      !("label" in link) ||
      typeof link.label !== "string" ||
      !("url" in link) ||
      typeof link.url !== "string"
    ) {
      throw new Error("Invalid related link");
    }
    return { label: link.label, url: link.url };
  });
}
