import "server-only";
import Link from "next/link";
import { OfficeTermList } from "../../shared/components/office-term-list";
import { findFormerOfficeHolders } from "../repositories/office-history-repository";

export async function FormerOfficeHolders() {
  const { terms, mayors, politicians } = await findFormerOfficeHolders();
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-5 py-10">
      <Link href="/politicians" className="text-primary underline">
        現職の市長・議員紹介へ
      </Link>
      <h1 className="text-2xl font-bold text-mirai-text">歴代市長・元議員</h1>
      <p className="text-sm text-mirai-text-secondary">
        当サイトで記録した退任者を掲載します。歴代全員の名簿ではありません。以前の発言・資料はそれぞれの人物のページで確認できます。
      </p>
      <section>
        <h2 className="text-xl font-bold text-mirai-text">歴代市長</h2>
        {mayors.length === 0 && (
          <p className="mt-3">記録された退任者はまだいません。</p>
        )}
        {mayors.map((person) => (
          <article key={person.id} className="mt-5">
            <Link
              href={`/politicians/mayor/history/${person.id}`}
              className="text-primary underline"
            >
              {person.name}
            </Link>
            <OfficeTermList
              terms={terms.filter((term) => term.mayor_id === person.id)}
            />
          </article>
        ))}
      </section>
      <section>
        <h2 className="text-xl font-bold text-mirai-text">元議員</h2>
        {politicians.length === 0 && (
          <p className="mt-3">記録された退任者はまだいません。</p>
        )}
        {politicians.map((person) => (
          <article key={person.id} className="mt-5">
            <Link
              href={`/politicians/${person.id}`}
              className="text-primary underline"
            >
              {person.name}
            </Link>
            <OfficeTermList
              terms={terms.filter((term) => term.politician_id === person.id)}
            />
          </article>
        ))}
      </section>
    </div>
  );
}
