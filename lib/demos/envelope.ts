/**
 * Envelope encryption for the content protection demo.
 *
 * This is real cryptography, not a mock: content is sealed with AES-GCM under a
 * per-article data key, and that data key is itself sealed under a master key
 * that is generated non-extractable, so it cannot be read back out of the
 * runtime. That is the same shape as a KMS customer master key wrapping a data
 * key. What is abstracted is the boundary, since here the "KMS" is local.
 *
 * Kept out of the component so it can be exercised directly under Node, which
 * provides the same Web Crypto API as the browser.
 */

export type Bundle = {
  /** Stands in for the KMS master key. Generated non-extractable on purpose. */
  masterKey: CryptoKey
  /** The data key, encrypted under the master key. */
  wrappedKey: ArrayBuffer
  ciphertext: ArrayBuffer
  ciphertextB64: string
  // Held as BufferSource because these are only ever handed straight back to
  // crypto.subtle as the AES-GCM nonce.
  wrapIv: BufferSource
  contentIv: BufferSource
}

export function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index])
  }
  return btoa(binary)
}

/** True when the runtime can actually perform the demo's cryptography. */
export function hasWebCrypto(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined'
}

export async function createBundle(plaintext: string): Promise<Bundle> {
  const encoder = new TextEncoder()

  // Master key stays non-extractable, standing in for a key that never leaves KMS.
  const masterKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ])

  const dataKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ])

  const contentIv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: contentIv },
    dataKey,
    encoder.encode(plaintext)
  )

  // Wrap the data key under the master key: the envelope.
  const rawDataKey = await crypto.subtle.exportKey('raw', dataKey)
  const wrapIv = crypto.getRandomValues(new Uint8Array(12))
  const wrappedKey = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: wrapIv },
    masterKey,
    rawDataKey
  )

  return {
    masterKey,
    wrappedKey,
    wrapIv,
    ciphertext,
    contentIv,
    ciphertextB64: toBase64(ciphertext),
  }
}

/**
 * Unwrap the data key, then decrypt the content with it.
 *
 * A revoked caller never reaches this function: the gateway refuses to unwrap,
 * which is why revocation does not require re-encrypting the article.
 */
export async function unwrapAndDecrypt(bundle: Bundle): Promise<string> {
  const rawDataKey = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: bundle.wrapIv },
    bundle.masterKey,
    bundle.wrappedKey
  )

  const dataKey = await crypto.subtle.importKey('raw', rawDataKey, 'AES-GCM', false, ['decrypt'])

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: bundle.contentIv },
    dataKey,
    bundle.ciphertext
  )

  return new TextDecoder().decode(plaintext)
}
