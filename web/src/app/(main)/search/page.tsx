import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layouts/container";
import { SearchForm } from "@/features/search/client/components/search-form";
import { SearchResultTabs } from "@/features/search/client/components/search-result-tabs";
import { loadSearchResults } from "@/features/search/server/loaders/search-loader";
import { parseSearchCategory } from "@/features/search/shared/utils/search-category";

export const metadata: Metadata = {
  title: "検索",
};

type Props = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, category: categoryParam } = await searchParams;
  const query = q?.trim() ?? "";
  const category = parseSearchCategory(categoryParam);
  const results =
    query || category !== "すべて"
      ? await loadSearchResults(query, category)
      : null;

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-bold text-mirai-text mb-6">検索</h1>
      <Suspense>
        <SearchForm />
      </Suspense>
      <div className="mt-8">
        <SearchResultTabs
          key={`${query}:${category}`}
          query={query}
          category={category}
          results={results}
        />
      </div>
    </Container>
  );
}
