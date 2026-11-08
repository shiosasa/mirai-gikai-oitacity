"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileEdit,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  approveSubmissionAction,
  deleteSiteAction,
  updateSiteAction,
  updateSubmissionStatusAction,
} from "../../server/actions/portal-actions";
import type {
  PortalSite,
  PortalSubmission,
} from "../../server/repositories/portal-repository";

type Props = {
  submissions: PortalSubmission[];
  sites: PortalSite[];
};

type SiteEditForm = {
  siteName: string;
  url: string;
  prefecture: string;
  municipality: string;
  governanceType: string;
  region: string;
  authorName: string;
  authorSocialUrl: string;
  description: string;
};

const GOVERNANCE_TYPES = ["本家・全国", "都道府県", "市区", "町村"];
const REGIONS = [
  "全国",
  "北海道・東北",
  "関東",
  "中部",
  "近畿",
  "中国・四国",
  "九州・沖縄",
];

function toSiteEditForm(site: PortalSite): SiteEditForm {
  return {
    siteName: site.site_name,
    url: site.url,
    prefecture: site.prefecture,
    municipality: site.municipality,
    governanceType: site.governance_type,
    region: site.region,
    authorName: site.author_name,
    authorSocialUrl: site.author_social_url ?? "",
    description: site.description,
  };
}

export function PortalManager({ submissions, sites }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"submissions" | "sites">(
    "submissions"
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<PortalSubmission | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 編集・承認用のフォームステート
  const [approveForm, setApproveForm] = useState({
    siteId: "",
    siteName: "",
    url: "",
    prefecture: "",
    municipality: "",
    governanceType: "市区",
    region: "関東",
    authorName: "",
    authorSocialUrl: "",
    description: "",
    genres: "Webアプリ",
  });
  const [editingSite, setEditingSite] = useState<PortalSite | null>(null);
  const [siteForm, setSiteForm] = useState<SiteEditForm | null>(null);

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  const handleOpenApproveModal = (sub: PortalSubmission) => {
    setSelectedSubmission(sub);
    setApproveForm({
      siteId: sub.site_name ? `site-${Date.now()}` : "",
      siteName: sub.site_name || "",
      url: sub.url || "",
      prefecture: sub.prefecture || "",
      municipality: sub.municipality || "",
      governanceType: sub.governance_type || "市区",
      region: sub.region || "関東",
      authorName: sub.author_name || "",
      authorSocialUrl: sub.author_social_url || "",
      description: sub.description || "",
      genres: sub.genres.length ? sub.genres.join(", ") : "Webアプリ",
    });
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.set("submissionId", selectedSubmission.id);
      formData.set("siteId", approveForm.siteId);
      formData.set("siteName", approveForm.siteName);
      formData.set("url", approveForm.url);
      formData.set("prefecture", approveForm.prefecture);
      formData.set("municipality", approveForm.municipality);
      formData.set("governanceType", approveForm.governanceType);
      formData.set("region", approveForm.region);
      formData.set("authorName", approveForm.authorName);
      formData.set("authorSocialUrl", approveForm.authorSocialUrl);
      formData.set("description", approveForm.description);
      formData.set("genres", approveForm.genres);

      await approveSubmissionAction(formData);
      setSelectedSubmission(null);
    } catch (err) {
      alert(
        `エラーが発生しました: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "approved" | "rejected" | "pending"
  ) => {
    if (!confirm(`ステータスを「${status}」に変更しますか？`)) return;
    setIsProcessing(true);
    try {
      await updateSubmissionStatusAction(id, status);
    } catch (err) {
      alert(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async (site: PortalSite) => {
    try {
      await updateSiteAction(site.id, { is_active: !site.is_active });
      router.refresh();
    } catch (err) {
      alert(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleOpenSiteEdit = (site: PortalSite) => {
    setEditingSite(site);
    setSiteForm(toSiteEditForm(site));
  };

  const handleSaveSite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingSite || !siteForm) return;
    if (!siteForm.siteName.trim() || !siteForm.url.trim()) {
      alert("サイト名とURLは必須です");
      return;
    }
    setIsProcessing(true);
    try {
      await updateSiteAction(editingSite.id, {
        site_name: siteForm.siteName.trim(),
        url: siteForm.url.trim(),
        prefecture: siteForm.prefecture.trim(),
        municipality: siteForm.municipality.trim(),
        governance_type: siteForm.governanceType,
        region: siteForm.region,
        author_name: siteForm.authorName.trim(),
        author_social_url: siteForm.authorSocialUrl.trim() || null,
        description: siteForm.description.trim(),
      });
      setEditingSite(null);
      setSiteForm(null);
      router.refresh();
    } catch (err) {
      alert(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSite = async (site: PortalSite) => {
    if (!confirm(`「${site.site_name}」を掲載リストから削除しますか？`)) return;
    try {
      await deleteSiteAction(site.id);
    } catch (err) {
      alert(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* タブ切り替え */}
      <div className="flex border-b border-gray-200 gap-2">
        <Button
          type="button"
          variant={activeTab === "submissions" ? "default" : "ghost"}
          onClick={() => setActiveTab("submissions")}
          className="flex items-center gap-2"
        >
          <span>届いた申請・報告</span>
          {pendingCount > 0 && (
            <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {pendingCount}件未対応
            </span>
          )}
        </Button>

        <Button
          type="button"
          variant={activeTab === "sites" ? "default" : "ghost"}
          onClick={() => setActiveTab("sites")}
          className="flex items-center gap-2"
        >
          <span>掲載中サイト一覧</span>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {sites.length}件
          </span>
        </Button>
      </div>

      {/* 1. 届いた申請一覧 */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-200">
              現在、届いている申請・報告はありません。
            </div>
          ) : (
            submissions.map((sub) => {
              const isPending = sub.status === "pending";

              return (
                <div
                  key={sub.id}
                  className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 transition-all ${
                    isPending
                      ? "border-emerald-300 ring-1 ring-emerald-200"
                      : "border-gray-200 opacity-75"
                  }`}
                >
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      {sub.report_type === "broken" ? (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          リンク切れ・閉鎖報告
                        </span>
                      ) : sub.report_type === "update" ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
                          <FileEdit className="w-3.5 h-3.5" />
                          掲載内容の変更連絡
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          新規掲載の申請（自薦・他薦）
                        </span>
                      )}

                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          isPending
                            ? "bg-amber-100 text-amber-800"
                            : sub.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isPending
                          ? "未対応"
                          : sub.status === "approved"
                            ? "承認済み"
                            : "対応済み/却下"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(sub.created_at).toLocaleString("ja-JP")}
                    </div>
                  </div>

                  {/* 申請内容 */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-base text-gray-900">
                        {sub.site_name}
                      </span>
                      {(sub.prefecture || sub.municipality) && (
                        <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                          {sub.prefecture} {sub.municipality}
                        </span>
                      )}
                    </div>

                    {sub.url && (
                      <div className="text-xs">
                        <a
                          href={sub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          {sub.url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {sub.author_name && (
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold">製作者:</span>{" "}
                        {sub.author_name}
                        {sub.author_social_url && (
                          <a
                            href={sub.author_social_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:underline ml-2"
                          >
                            (SNS/URL)
                          </a>
                        )}
                      </div>
                    )}

                    {sub.description && (
                      <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg leading-relaxed">
                        {sub.description}
                      </p>
                    )}

                    {sub.broken_detail && (
                      <div className="text-xs text-rose-800 bg-rose-50 p-3 rounded-lg">
                        <span className="font-bold">状況の詳細:</span>{" "}
                        {sub.broken_detail}
                      </div>
                    )}

                    {/* 連絡者情報 */}
                    {(sub.reporter_name || sub.reporter_contact) && (
                      <div className="text-xs text-gray-400 pt-1">
                        連絡者: {sub.reporter_name || "匿名"} (
                        {sub.reporter_contact || "連絡先なし"})
                      </div>
                    )}
                  </div>

                  {/* アクションボタン */}
                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    {sub.report_type !== "broken" ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleOpenApproveModal(sub)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        確認して掲載承認（サイトに追加）
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusChange(sub.id, "approved")}
                        className="font-bold"
                      >
                        確認済みにする
                      </Button>
                    )}

                    {isPending && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(sub.id, "rejected")}
                        className="text-gray-600 font-medium"
                      >
                        対応済みにする
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. 掲載中サイト一覧 */}
      {activeTab === "sites" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs font-bold text-gray-500">
            <span>掲載サイト（全{sites.length}件）</span>
            <span>内容の修正と公開・非公開を切り替えられます</span>
          </div>

          <div className="divide-y divide-gray-100">
            {sites.map((site) => (
              <div
                key={site.id}
                className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {site.prefecture} {site.municipality}
                    </span>
                    <span className="font-bold text-gray-900">
                      {site.site_name}
                    </span>
                    {site.is_official && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                        公式
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-600 inline-flex items-center gap-1"
                    >
                      {site.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="ml-3">製作者: {site.author_name}</span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {site.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenSiteEdit(site)}
                    className="text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    内容を編集
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={site.is_active ? "outline" : "secondary"}
                    onClick={() => handleToggleActive(site)}
                    className="text-xs"
                  >
                    {site.is_active ? "公開中" : "非公開"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteSite(site)}
                    className="text-xs text-red-600 hover:bg-red-50 p-1.5"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingSite && siteForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-emerald-600" />
              掲載内容を編集
            </h3>
            <p className="text-xs text-gray-500">
              サイト名、URL、紹介文、地域、区分を直せます。公開・非公開は一覧のボタンで切り替えます。
            </p>
            <form onSubmit={handleSaveSite} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="edit-pref"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    都道府県
                  </label>
                  <input
                    id="edit-pref"
                    type="text"
                    required
                    value={siteForm.prefecture}
                    onChange={(event) =>
                      setSiteForm({
                        ...siteForm,
                        prefecture: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-muni"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    市区町村
                  </label>
                  <input
                    id="edit-muni"
                    type="text"
                    required
                    value={siteForm.municipality}
                    onChange={(event) =>
                      setSiteForm({
                        ...siteForm,
                        municipality: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="edit-sitename"
                  className="block font-bold text-gray-700 mb-1"
                >
                  サイト名
                </label>
                <input
                  id="edit-sitename"
                  type="text"
                  required
                  value={siteForm.siteName}
                  onChange={(event) =>
                    setSiteForm({ ...siteForm, siteName: event.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-url"
                  className="block font-bold text-gray-700 mb-1"
                >
                  公開URL
                </label>
                <input
                  id="edit-url"
                  type="url"
                  required
                  value={siteForm.url}
                  onChange={(event) =>
                    setSiteForm({ ...siteForm, url: event.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="edit-governance"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    議会の単位
                  </label>
                  <select
                    id="edit-governance"
                    value={siteForm.governanceType}
                    onChange={(event) =>
                      setSiteForm({
                        ...siteForm,
                        governanceType: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {GOVERNANCE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="edit-region"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    地図の地域
                  </label>
                  <select
                    id="edit-region"
                    value={siteForm.region}
                    onChange={(event) =>
                      setSiteForm({ ...siteForm, region: event.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="edit-author"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    製作者名
                  </label>
                  <input
                    id="edit-author"
                    type="text"
                    required
                    value={siteForm.authorName}
                    onChange={(event) =>
                      setSiteForm({
                        ...siteForm,
                        authorName: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-social"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    SNS・URL（任意）
                  </label>
                  <input
                    id="edit-social"
                    type="url"
                    value={siteForm.authorSocialUrl}
                    onChange={(event) =>
                      setSiteForm({
                        ...siteForm,
                        authorSocialUrl: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="edit-desc"
                  className="block font-bold text-gray-700 mb-1"
                >
                  紹介文
                </label>
                <textarea
                  id="edit-desc"
                  rows={4}
                  required
                  value={siteForm.description}
                  onChange={(event) =>
                    setSiteForm({
                      ...siteForm,
                      description: event.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingSite(null);
                    setSiteForm(null);
                  }}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? "保存中..." : "掲載内容を保存"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 承認モーダル */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              掲載内容の確認・編集して承認
            </h3>
            <p className="text-xs text-gray-500">
              内容に問題がなければ「承認して公開リストに追加」を押してください。誤字等の修正も可能です。
            </p>

            <form
              onSubmit={handleApproveSubmit}
              className="space-y-4 text-xs sm:text-sm"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="approve-pref"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    都道府県
                  </label>
                  <input
                    id="approve-pref"
                    type="text"
                    required
                    value={approveForm.prefecture}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        prefecture: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="approve-muni"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    市区町村
                  </label>
                  <input
                    id="approve-muni"
                    type="text"
                    required
                    value={approveForm.municipality}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        municipality: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="approve-sitename"
                  className="block font-bold text-gray-700 mb-1"
                >
                  サイト名
                </label>
                <input
                  id="approve-sitename"
                  type="text"
                  required
                  value={approveForm.siteName}
                  onChange={(e) =>
                    setApproveForm({ ...approveForm, siteName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="approve-url"
                  className="block font-bold text-gray-700 mb-1"
                >
                  公開URL
                </label>
                <input
                  id="approve-url"
                  type="url"
                  required
                  value={approveForm.url}
                  onChange={(e) =>
                    setApproveForm({ ...approveForm, url: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="approve-author"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    製作者名
                  </label>
                  <input
                    id="approve-author"
                    type="text"
                    required
                    value={approveForm.authorName}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        authorName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="approve-social"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    SNS・URL（任意）
                  </label>
                  <input
                    id="approve-social"
                    type="url"
                    value={approveForm.authorSocialUrl}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        authorSocialUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="approve-desc"
                  className="block font-bold text-gray-700 mb-1"
                >
                  紹介文
                </label>
                <textarea
                  id="approve-desc"
                  rows={3}
                  required
                  value={approveForm.description}
                  onChange={(e) =>
                    setApproveForm({
                      ...approveForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg shadow-sm"
                >
                  {isProcessing ? "登録中..." : "承認して公開リストに追加"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
