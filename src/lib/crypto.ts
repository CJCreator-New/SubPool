import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

/**
 * P2.1 Credential Vault Crypto Utilities
 * Derives a 32-byte deterministic key from the environment solely for demo purposes.
 * In production, keys should be securely derived client-side per user or via a KMS.
 */
function getMasterKey(): Uint8Array {
    const rawEnvKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'default_fallback_demo_key_for_testing';
    const keyString = rawEnvKey.padEnd(32, '0').slice(0, 32);
    return naclUtil.decodeUTF8(keyString);
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
