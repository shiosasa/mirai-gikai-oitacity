"use server";

import { revalidatePath } from "next/cache";
import {
  approvePortalSubmission,
  deletePortalSite,
  updatePortalSite,
  updatePortalSubmissionStatus,
} from "../repositories/portal-repository";

export async function approveSubmissionAction(formData: FormData) {
  const submissionId = formData.get("submissionId") as string;
  const siteId = (formData.get("siteId") as string) || `site-${Date.now()}`;
  const prefecture = formData.get("prefecture") as string;
  const municipality = formData.get("municipality") as string;
  const siteName = formData.get("siteName") as string;
  const url = formData.get("url") as string;
  const authorName = formData.get("authorName") as string;
  const authorSocialUrl = (formData.get("authorSocialUrl") as string) || null;
  const description = formData.get("description") as string;
  const region = (formData.get("region") as string) || "関東";
  const governanceType = (formData.get("governanceType") as string) || "市区";
  const genresRaw = formData.get("genres") as string;
  const genres = genresRaw
    ? genresRaw
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean)
    : ["Webアプリ"];

  if (!siteName || !url) {
    throw new Error("サイト名とURLは必須です");
  }

  await approvePortalSubmission(submissionId, {
    id: siteId,
    prefecture,
    municipality,
    site_name: siteName,
    url,
    author_name: authorName || "有志",
    author_social_url: authorSocialUrl,
    description: description || siteName,
    genres,
    governance_type: governanceType,
    region,
  });

  revalidatePath("/portal");
}

export async function updateSubmissionStatusAction(
  submissionId: string,
  status: "approved" | "rejected" | "pending",
  notes?: string
) {
  await updatePortalSubmissionStatus(submissionId, status, notes);
  revalidatePath("/portal");
}

export async function updateSiteAction(
  siteId: string,
  updates: {
    site_name?: string;
    url?: string;
    description?: string;
    is_active?: boolean;
    author_name?: string;
  }
) {
  await updatePortalSite(siteId, updates);
  revalidatePath("/portal");
}

export async function deleteSiteAction(siteId: string) {
  await deletePortalSite(siteId);
  revalidatePath("/portal");
}
