/**
 * Generate secure, user-friendly passwords
 * Format: ISP-XXXX-XXXX (e.g., ISP-ABCD-1234)
 */
export function generateHotspotPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars (0,O,I,1)
  const first = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
  const second = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");

  return `ISP-${first}-${second}`;
}

/**
 * Generate a simple numeric PIN for PPPoE
 */
export function generatePPPoEPassword(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate WiFi password (mix of letters and numbers)
 */
export function generateWiFiPassword(length: number = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}
