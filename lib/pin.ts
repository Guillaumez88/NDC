import * as Crypto from 'expo-crypto';

export async function hasherPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}
