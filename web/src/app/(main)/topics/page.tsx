import Link from "next/link";
import { Container } from "@/components/layouts/container";
import { ArticlesSection } from "@/features/bills/server/components/articles-section";
import { getPublishedArticles } from "@/features/bills/server/loaders/get-articles";

export const metadata = {
  title: "トピックス | みらいぎかいっち＠大分",
};

export default async function TopicsPage() {
  const articles = await getPublishedArticles();

  return (
    <Container className="py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-primary-accent hover:text-primary font-medium mb-4 inline-block"
        >
          ← 戻る
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-sm text-mirai-text-muted text-center">
          記事はまだ掲載されていません。
        </p>
      ) : (
        <ArticlesSection articles={articles} />
      )}
    </Container>
  );
}
