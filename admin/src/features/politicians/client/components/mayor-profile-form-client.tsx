"use client";

import { saveMayorProfile } from "../../server/actions/save-mayor-profile";
import type { MayorProfileRecord } from "../../shared/utils/mayor-profile";
import { MayorProfileForm } from "./mayor-profile-form";

export function MayorProfileFormClient({
  initial,
}: {
  initial: MayorProfileRecord;
}) {
  return <MayorProfileForm initial={initial} onSave={saveMayorProfile} />;
}
