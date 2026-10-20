/**
 * Authentication & Security PIN Validation
 */

export const ADMIN_SECURITY_PIN = '250205';

export function verifyAdminPin(pin: string): boolean {
  if (!pin) return false;
  return pin.trim() === ADMIN_SECURITY_PIN;
}
