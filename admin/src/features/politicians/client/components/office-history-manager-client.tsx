"use client";
import type { OfficeTerm } from "@mirai-gikai/shared/politicians/office-history";
import { useRouter } from "next/navigation";
import { changeOfficeTerm } from "../../server/actions/change-office";
import type { OfficePerson } from "../../shared/utils/office-change";
import { OfficeHistoryManager } from "./office-history-manager";
export function OfficeHistoryManagerClient(props: {
  people: OfficePerson[];
  terms: OfficeTerm[];
}) {
  const router = useRouter();
  return (
    <OfficeHistoryManager
      {...props}
      onSave={changeOfficeTerm}
      onRefresh={() => router.refresh()}
    />
  );
}
