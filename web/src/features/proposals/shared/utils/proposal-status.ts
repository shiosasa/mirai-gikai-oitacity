/** status_class に応じたバッジスタイルを返す */
export function getProposalStatusStyle(statusClass: string): {
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (statusClass) {
    case "approved":
      return {
        bgClass: "bg-stance-for-bg",
        textClass: "text-jimu-up",
        borderClass: "border-jimu-up/30",
      };
    case "rejected":
      return {
        bgClass: "bg-stance-against-bg",
        textClass: "text-stance-against",
        borderClass: "border-stance-against/30",
      };
    default:
      // "in_progress" など
      return {
        bgClass: "bg-oita-pink-light",
        textClass: "text-oita-pink",
        borderClass: "border-oita-pink-accent",
      };
  }
}
