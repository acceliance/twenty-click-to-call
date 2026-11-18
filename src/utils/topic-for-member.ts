export type WorkspaceMember = { userEmail?: string | null };

// ntfy topics allow [A-Za-z0-9_-] only.
// "Élodie.Martin@example.com" -> "elodie-martin"; falls back to the member id when there is no email.
export const topicSuffixFor = (
  member: WorkspaceMember | null | undefined,
  workspaceMemberId: string,
): string => {
  const localPart = member?.userEmail?.split('@')[0] ?? '';
  const slug = localPart
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || workspaceMemberId;
};
