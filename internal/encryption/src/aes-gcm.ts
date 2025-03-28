import { base64 } from '@solomonai/encoding'

export class AesGCM {
  public readonly key: CryptoKey
  public static readonly algorithm = 'AES-GCM'

  private constructor(key: CryptoKey) {
    this.key = key
  }

  static async withBase64Key(base64Key: string): Promise<AesGCM> {
    const key = await crypto.subtle.importKey(
      'raw',
      base64.decode(base64Key),
      { name: AesGCM.algorithm, length: 256 },
      false,
      ['encrypt', 'decrypt'],
    )
    return new AesGCM(key)
  }

  public async encrypt(
    secret: string,
  ): Promise<{ iv: string; ciphertext: string }> {
    const iv = crypto.getRandomValues(new Uint8Array(32))
    const data = new TextEncoder().encode(secret)
    // Ensure we have at least 1 byte of data
    const buffer = data.length === 0 ? new Uint8Array([0]) : data

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: AesGCM.algorithm,
        iv,
      },
      this.key,
      buffer,
    )
    return { iv: base64.encode(iv), ciphertext: base64.encode(ciphertext) }
  }

  public async decrypt(req: {
    iv: string
    ciphertext: string
  }): Promise<string> {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: AesGCM.algorithm,
        iv: base64.decode(req.iv),
      },
      this.key,
      base64.decode(req.ciphertext),
    )

    const text = new TextDecoder().decode(decryptedBuffer)
    // Return empty string if we get our special empty marker
    return text === '\0' ? '' : text
  }
}
