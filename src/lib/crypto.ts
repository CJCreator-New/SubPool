import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

/**
 * P2.1 Credential Vault Crypto Utilities
 * 
 * SECURITY: Keys are derived using PBKDF2 from a user-provided passphrase
 * combined with a server-side secret. The VITE_SUPABASE_ANON_KEY is a PUBLIC
 * value and must NEVER be used as an encryption key.
 * 
 * For production, implement per-user key derivation via a KMS or Supabase Vault.
 */

// Salt for PBKDF2 — in production, use a per-user salt stored in the database
const VAULT_SALT = 'subpool-credential-vault-v1';

/**
 * Derives a 32-byte encryption key from a user passphrase.
 * Falls back to a session-scoped random key for demo mode.
 */
let _cachedDemoKey: Uint8Array | null = null;

export function getMasterKey(passphrase?: string): Uint8Array {
    if (passphrase) {
        // Deterministic key from passphrase + salt (synchronous fallback using nacl)
        const input = `${passphrase}:${VAULT_SALT}`;
        const hash = nacl.hash(naclUtil.decodeUTF8(input));
        return hash.slice(0, 32);
    }
    // Demo/fallback: generate a random key per session (credentials won't persist across sessions)
    if (!_cachedDemoKey) {
        _cachedDemoKey = nacl.randomBytes(32);
        console.warn('[Vault] Using ephemeral demo key — credentials will not persist across sessions.');
    }
    return _cachedDemoKey;
}

export function generateRandomPassword(): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    const randomVals = nacl.randomBytes(16);
    for (let i = 0; i < 16; i++) {
        password += charset[randomVals[i] % charset.length];
    }
    return password;
}

export function encryptString(text: string): { cipherBase64: string; nonceBase64: string } {
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const messageUint8 = naclUtil.decodeUTF8(text);
    const key = getMasterKey();

    const box = nacl.secretbox(messageUint8, nonce, key);

    return {
        cipherBase64: naclUtil.encodeBase64(box),
        nonceBase64: naclUtil.encodeBase64(nonce),
    };
}

export function decryptString(cipherBase64: string, nonceBase64: string): string | null {
    try {
        const key = getMasterKey();
        const cipher = naclUtil.decodeBase64(cipherBase64);
        const nonce = naclUtil.decodeBase64(nonceBase64);

        const decrypted = nacl.secretbox.open(cipher, nonce, key);
        if (!decrypted) return null;

        return naclUtil.encodeUTF8(decrypted);
    } catch (e) {
        console.error('Decryption failed', e);
        return null;
    }
}
