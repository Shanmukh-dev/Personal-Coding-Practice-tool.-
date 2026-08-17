/**
 * Utility to extract or generate profile avatar URL from Gmail/Google account or email
 */
export function getProfileAvatarUrl(
  photoURL?: string | null,
  email?: string | null,
  displayName?: string | null
): string {
  if (photoURL && photoURL.trim().length > 0) {
    return photoURL;
  }

  // If email is present (e.g. tssv2006@gmail.com), use unavatar.io service which
  // automatically resolves Google account profile picture for Gmail addresses!
  if (email && email.includes('@')) {
    const cleanEmail = email.trim().toLowerCase();
    const fallbackInitials = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      displayName || cleanEmail
    )}&backgroundColor=1e293b&textColor=f8fafc`;
    return `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=${encodeURIComponent(
      fallbackInitials
    )}`;
  }

  if (displayName) {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      displayName
    )}&backgroundColor=1e293b&textColor=f8fafc`;
  }

  return `https://api.dicebear.com/7.x/initials/svg?seed=Engineer&backgroundColor=1e293b&textColor=f8fafc`;
}
