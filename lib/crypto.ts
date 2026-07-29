import * as Crypto from 'expo-crypto';

/**
 * SHA-256 hash of a phone number, for anonymized storage in
 * reviews_and_recommendations (spec #3). Normalizes to digits first so
 * formatting variants ("+1 (512) 555-0100" vs "15125550100") hash
 * identically. Uses expo-crypto — crypto.subtle does not exist in the
 * Expo/Hermes runtime.
 */
export async function hashPhone(phone: string): Promise<string> {
  const normalized = phone.replace(/\D/g, '');
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, normalized);
}
