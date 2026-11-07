import {
  Bell,
  BookOpen,
  CalendarDays,
  FileText,
  Landmark,
  LayoutDashboard,
  LayoutTemplate,
  MessagesSquare,
  Mic,
  Newspaper,
  Settings,
  Tags,
  UserRound,
  Users,
} from "lucide-react";

export const contentLinks = [
  {
    href: "/homepage",
    label: "トップページ",
    description: "トップの文章・画像・リンクをプレビューして更新",
    icon: LayoutTemplate,
  },
  {
    href: "/minutes",
    label: "議事録要約",
    description: "本会議・委員会の開催日ごとの要約や決定事項を更新",
    icon: BookOpen,
  },
  {
    href: "/bills",
    label: "議案カード",
    description: "議案の説明・タグ・公開状態を更新",
    icon: FileText,
  },
  {
    href: "/topics",
    label: "トピックスカード",
    description: "トピックス記事と公開状態を管理",
    icon: Newspaper,
  },
  {
    href: "/press-conferences",
    label: "記者会見",
    description: "市長会見の発表・質疑・配付資料を編集",
    icon: Mic,
  },
  {
    href: "/mayor-proposals",
    label: "市長提案理由",
    description: "会議ごとの提案理由・要約・公式出典を更新",
    icon: Landmark,
  },
  {
    href: "/office-history",
    label: "交代と任期履歴",
    description: "市長・議員の退任・後任登録・再選・再就任を管理",
    icon: Users,
  },
  {
    href: "/mayor-profile",
    label: "市長プロフィール",
    description: "市長の氏名・写真・経歴・公式リンクを更新",
    icon: UserRound,
  },
  {
    href: "/politician-speeches",
    label: "議員の発言",
    description: "議事録に基づく発言紹介を確認・公開",
    icon: MessagesSquare,
  },
  {
    href: "/information",
    label: "お知らせ",
    description: "トップページのお知らせを更新",
    icon: Bell,
  },
  {
    href: "/topic-voices",
    label: "インタビュー確認・公開",
    description: "回答・チャット履歴を確認し、要約を記事の「生の声」に掲載",
    icon: MessagesSquare,
  },
];

export const navigationGroups = [
  {
    label: "ホーム",
    links: [
      { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { href: "/update-guide", label: "手動更新ガイド", icon: BookOpen },
    ],
  },
  {
    label: "コンテンツ更新",
    links: contentLinks,
  },
  {
    label: "紹介ページ",
    links: [{ href: "/politicians", label: "議員紹介", icon: UserRound }],
  },
  {
    label: "議会の基本設定",
    links: [
      { href: "/council-sessions", label: "定例会", icon: CalendarDays },
      { href: "/committees", label: "委員会", icon: Users },
      { href: "/tags", label: "タグ", icon: Tags },
      { href: "/factions", label: "会派", icon: Users },
    ],
  },
  {
    label: "システム",
    links: [
      { href: "/ai-collection", label: "AI情報収集", icon: Settings },
      { href: "/admins", label: "管理者", icon: UserRound },
    ],
  },
];
