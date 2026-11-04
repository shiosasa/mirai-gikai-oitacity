type PreviewEnvironment = {
  NODE_ENV?: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
  MAYOR_LOCAL_DRAFT_PREVIEW?: string;
};

export function isMayorLocalPreviewEnabled(env: PreviewEnvironment): boolean {
  return (
    env.NODE_ENV === "development" &&
    !env.VERCEL &&
    !env.VERCEL_ENV &&
    env.MAYOR_LOCAL_DRAFT_PREVIEW === "1"
  );
}
