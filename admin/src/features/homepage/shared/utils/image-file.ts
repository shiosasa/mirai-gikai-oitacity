export const homepageImageLimit = 5 * 1024 * 1024;
export const homepageImageAccept = "image/png,image/jpeg,image/gif,image/webp";

export function validateHomepageImage(bytes: Uint8Array, mime: string): string {
  if (!bytes.length || bytes.length > homepageImageLimit)
    throw new Error("画像は5MB以下のファイルを選んでください");
  const startsWith = (signature: number[]) =>
    signature.every((value, index) => bytes[index] === value);
  if (mime === "image/png" && startsWith([137, 80, 78, 71, 13, 10, 26, 10]))
    return "png";
  if (mime === "image/jpeg" && startsWith([255, 216, 255])) return "jpg";
  if (
    mime === "image/gif" &&
    ["GIF87a", "GIF89a"].includes(String.fromCharCode(...bytes.slice(0, 6)))
  )
    return "gif";
  if (
    mime === "image/webp" &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return "webp";
  throw new Error(
    "PNG・JPEG・GIF・WebP形式の画像を選んでください（ファイルの内容と形式も一致する必要があります）"
  );
}
