export const statusOptions = [
  { value: "draft", label: "下書き" },
  { value: "structuring", label: "構造化中" },
  { value: "review", label: "確認待ち" },
  { value: "published", label: "公開" },
  { value: "error", label: "要対応" },
] as const;
export const itemOptions = [
  { value: "announcement", label: "発表" },
  { value: "qa", label: "質疑" },
] as const;
export const speakerOptions = [
  { value: "governor", label: "市長" },
  { value: "reporter", label: "記者" },
  { value: "secretariat", label: "事務局・担当課" },
] as const;
