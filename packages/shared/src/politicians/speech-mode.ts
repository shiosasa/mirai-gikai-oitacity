type SpeechEnvironment = {
  POLITICIAN_SPEECH_MODE?: string;
  NODE_ENV?: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
};

export type PoliticianSpeechMode = "disabled" | "database" | "preview";

export function getPoliticianSpeechMode(
  env: SpeechEnvironment
): PoliticianSpeechMode {
  switch (env.POLITICIAN_SPEECH_MODE) {
    case undefined:
    case "":
      return "disabled";
    case "database":
      return "database";
    case "preview": {
      const localDevelopment =
        env.NODE_ENV === "development" && !env.VERCEL && !env.VERCEL_ENV;
      const vercelPreview = env.VERCEL === "1" && env.VERCEL_ENV === "preview";
      if (localDevelopment || vercelPreview) return "preview";
      throw new Error("発言の見本表示はローカル開発またはVercel Previewのみ利用できます");
    }
    default:
      throw new Error("POLITICIAN_SPEECH_MODEの設定値が不正です");
  }
}
