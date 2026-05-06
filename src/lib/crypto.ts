// src/lib/crypto.ts
/**
 * Utility for AES-256-GCM encryption/decryption using Web Crypto API.
 * This is used for the Credential Vault to store sensitive data in Supabase.
 * Note: In a production app, the 'master key' should be derived from the user's password 
 * or a server-side secret. For this implementation, we use a simplified approach 
 * with a derived key from the pool's secret or a global system key.
 */

const ALGORITHM = 'AES-256-GCM';

async function getMasterKey() {
  // In a real app, this would be fetched from an environment variable or KMS
  const secret = import.meta.env.VITE_ENCRYPTION_KEY || 'subpool-default-system-master-key-32chars';
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: string): Promise<{ encrypted: string; nonce: string }> {
  const key = await getMasterKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encodedData = enc.encode(data);

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encodedData
  );

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    nonce: btoa(String.fromCharCode(...iv))
  };
}

export async function decryptData(encryptedB64: string, nonceB64: string): Promise<string> {
  const key = await getMasterKey();
  const iv = new Uint8Array(atob(nonceB64).split('').map(c => c.charCodeAt(0)));
  const encrypted = new Uint8Array(atob(encryptedB64).split('').map(c => c.charCodeAt(0)));

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
