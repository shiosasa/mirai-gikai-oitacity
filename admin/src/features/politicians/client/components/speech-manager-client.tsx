"use client";

import { useRouter } from "next/navigation";
import {
  saveSpeechHighlight,
  unpublishSpeechHighlight,
} from "../../server/actions/save-speech-highlight";
import { SpeechManager, type SpeechManagerData } from "./speech-manager";

export function SpeechManagerClient(props: SpeechManagerData) {
  const router = useRouter();
  return (
    <SpeechManager
      {...props}
      onSave={saveSpeechHighlight}
      onUnpublish={unpublishSpeechHighlight}
      onRefresh={() => router.refresh()}
      confirm={(message) => window.confirm(message)}
      scrollToForm={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    />
  );
}
