/** Zkratka do avataru: „Miroslav Peterka“ → „MP“, jinak první písmeno e-mailu. */
export function userInitials(
  displayName: string | null | undefined,
  email?: string | null,
): string {
  const name = (displayName ?? '').trim();
  if (name) {
    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
  }
  return (email ?? '?').charAt(0).toUpperCase();
}
