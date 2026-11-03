import "server-only";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  type ListSearchParams,
  pageHref,
  pageSize,
} from "../../shared/utils/content-input";

export function ListPagination({
  path,
  search,
  page,
  count,
}: {
  path: string;
  search: ListSearchParams;
  page: number;
  count: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-muted-foreground">
        {count}件 / {page}ページ目
      </p>
      {page > 1 && (
        <Button asChild variant="outline">
          <Link href={pageHref(path, search, page - 1)}>前へ</Link>
        </Button>
      )}
      {page * pageSize < count && (
        <Button asChild variant="outline">
          <Link href={pageHref(path, search, page + 1)}>次へ</Link>
        </Button>
      )}
    </div>
  );
}
