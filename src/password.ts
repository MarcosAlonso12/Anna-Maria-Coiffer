const encoder = new TextEncoder();
const hex = (b: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('');
export async function hashPassword(password: string, pepper: string, salt = hex(crypto.getRandomValues(new Uint8Array(16)))) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password + '\0' + pepper), 'PBKDF2', false, ['deriveBits']);
  const result = await crypto.subtle.deriveBits({name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: 100000}, key, 256);
  return `pbkdf2$100000$${salt}$${hex(result)}`;
}
export async function verifyPassword(password: string, stored: string | null, pepper: string) {
  const parts = (stored || '').split('$');
  const valid = parts.length === 4 && parts[0] === 'pbkdf2' && parts[1] === '100000' && /^[a-f0-9]{32}$/.test(parts[2]) && /^[a-f0-9]{64}$/.test(parts[3]);
  const result = await hashPassword(password, pepper, valid ? parts[2] : '0'.repeat(32));
  const expected = valid ? stored! : 'x'.repeat(result.length);
  let diff = result.length ^ expected.length;
  for (let i = 0; i < result.length; i++) diff |= result.charCodeAt(i) ^ (expected.charCodeAt(i) || 0);
  return valid && diff === 0;
}
