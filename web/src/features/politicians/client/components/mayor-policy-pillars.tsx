import { extractMayorPolicy } from "../../shared/utils/extract-mayor-policy";

type Props = {
  bio: string | null;
};

export function MayorPolicyPillars({ bio }: Props) {
  const policy = extractMayorPolicy(bio);
  if (policy.pillars.length === 0) return null;

  return (
    <div className="mt-6 border-t border-mirai-border pt-5">
      <h3 className="text-base font-bold text-mirai-text">
        まちづくりの5つの柱
      </h3>
      {policy.motto && (
        <p className="mt-2 text-sm font-semibold text-mirai-text-secondary">
          基本方針「{policy.motto}」
        </p>
      )}
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {policy.pillars.map((pillar) => (
          <li
            key={pillar}
            className="rounded-md bg-oita-pink-light px-4 py-3 text-sm font-semibold text-mirai-text"
          >
            {pillar}
          </li>
        ))}
      </ul>
    </div>
  );
}
