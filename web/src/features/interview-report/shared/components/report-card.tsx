import { getMunicipalityConnectionLabel } from "@mirai-gikai/shared/interview/municipality-connection";
import Image from "next/image";
import Link from "next/link";
import { getPublicReportLink } from "@/features/interview-config/shared/utils/interview-links";
import { cn } from "@/lib/utils";
import {
  formatRoleLabel,
  type InterviewReportRole,
  roleIcons,
  stanceLabels,
  stanceTextColors,
} from "../constants";
import { formatRelativeTime } from "../utils/format-relative-time";

export interface ReportCardData {
  id: string;
  stance: string | null;
  role: string | null;
  role_title: string | null;
  municipality_connection: "resident" | "connected" | "other" | null;
  summary: string | null;
  created_at: string;
}

interface ReportCardProps {
  report: ReportCardData;
  summaryMaxLength?: number;
}

export function ReportCard({ report, summaryMaxLength = 80 }: ReportCardProps) {
  const stanceLabel = report.stance
    ? stanceLabels[report.stance] || report.stance
    : null;
  const stanceTextColor = report.stance
    ? stanceTextColors[report.stance] || ""
    : "";
  const RoleIcon = report.role
    ? roleIcons[report.role as InterviewReportRole]
    : null;
  const roleLabel = report.role_title || formatRoleLabel(report.role);
  const municipalityConnectionLabel = getMunicipalityConnectionLabel(
    report.municipality_connection
  );
  const relativeTime = formatRelativeTime(report.created_at);

  const summary = report.summary || "";
  const truncatedSummary =
    summary.length > summaryMaxLength
      ? `${summary.slice(0, summaryMaxLength)}...`
      : summary;

  return (
    <Link
      href={getPublicReportLink(report.id)}
      className="block bg-white rounded-lg p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-2">
        {report.stance && (
          <Image
            src={`/icons/stance-${report.stance}.png`}
            alt={stanceLabel || ""}
            width={38}
            height={38}
            className="rounded-full flex-shrink-0"
          />
        )}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          {stanceLabel && (
            <span className={cn("text-base font-bold", stanceTextColor)}>
              {stanceLabel}
            </span>
          )}
          <div className="flex items-center gap-2">
            {municipalityConnectionLabel && (
              <span className="text-xs text-mirai-text-subtle">
                {municipalityConnectionLabel}
              </span>
            )}
            {roleLabel && (
              <div className="flex items-center gap-0.5 text-mirai-text-subtle">
                {RoleIcon && <RoleIcon size={16} className="flex-shrink-0" />}
                <span className="text-xs">{roleLabel}</span>
              </div>
            )}
            <span className="text-[13px] text-mirai-text-muted leading-[1.2]">
              {relativeTime}
            </span>
          </div>
        </div>
      </div>

      {truncatedSummary && (
        <p className="mt-2 text-[13px] leading-[1.692] text-black">
          {truncatedSummary}
        </p>
      )}
    </Link>
  );
}
