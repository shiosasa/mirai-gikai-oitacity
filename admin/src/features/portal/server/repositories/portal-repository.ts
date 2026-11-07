import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";

export type PortalSubmission = {
  id: string;
  report_type: "new" | "update" | "broken";
  prefecture: string | null;
  municipality: string | null;
  site_name: string;
  url: string | null;
  author_name: string | null;
  author_social_url: string | null;
  description: string | null;
  genres: string[];
  governance_type: string;
  region: string;
  reporter_name: string | null;
  reporter_contact: string | null;
  broken_detail: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PortalSite = {
  id: string;
  prefecture: string;
  municipality: string;
  site_name: string;
  url: string;
  author_name: string;
  author_social_url: string | null;
  description: string;
  genres: string[];
  governance_type: string;
  region: string;
  is_official: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * 届いた申請一覧を取得（未対応優先）
 */
export async function getPortalSubmissions() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("portal_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch portal submissions:", error);
    return [];
  }
  return (data ?? []) as unknown as PortalSubmission[];
}

/**
 * 掲載中サイト一覧を取得
 */
export async function getPortalSites(): Promise<PortalSite[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("portal_sites")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch portal sites:", error);
    return [];
  }
  return (data ?? []) as unknown as PortalSite[];
}

/**
 * 申請を承認して、サイト一覧に追加（新規）または反映
 */
export async function approvePortalSubmission(
  submissionId: string,
  siteData: {
    id: string;
    prefecture: string;
    municipality: string;
    site_name: string;
    url: string;
    author_name: string;
    author_social_url?: string | null;
    description: string;
    genres: string[];
    governance_type: string;
    region: string;
  }
) {
  const supabase = createAdminClient();

  // 1. サイトテーブルに登録（または更新）
  const { error: siteError } = await supabase.from("portal_sites").upsert({
    ...siteData,
    updated_at: new Date().toISOString(),
  });

  if (siteError) {
    throw new Error(`サイトの登録に失敗しました: ${siteError.message}`);
  }

  // 2. 申請ステータスを approved に更新
  const { error: subError } = await supabase
    .from("portal_submissions")
    .update({
      status: "approved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (subError) {
    throw new Error(`申請ステータスの更新に失敗しました: ${subError.message}`);
  }
}

/**
 * 申請を対応済み・却下に更新
 */
export async function updatePortalSubmissionStatus(
  submissionId: string,
  status: "approved" | "rejected" | "pending",
  adminNotes?: string
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("portal_submissions")
    .update({
      status,
      admin_notes: adminNotes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) {
    throw new Error(`更新に失敗しました: ${error.message}`);
  }
}

/**
 * 掲載サイトの更新
 */
export async function updatePortalSite(
  siteId: string,
  updates: Partial<PortalSite>
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("portal_sites")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", siteId);

  if (error) {
    throw new Error(`サイト情報の更新に失敗しました: ${error.message}`);
  }
}

/**
 * 掲載サイトの削除
 */
export async function deletePortalSite(siteId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("portal_sites")
    .delete()
    .eq("id", siteId);

  if (error) {
    throw new Error(`サイトの削除に失敗しました: ${error.message}`);
  }
}
