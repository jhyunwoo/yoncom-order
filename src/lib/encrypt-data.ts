export default async function encryptData(data: string) {
  const key = (await crypto.subtle.generateKey(
    { name: "AES-CBC", length: 256 },
    true,
    ["encrypt", "decrypt"],
  )) as CryptoKey;

  const iv = crypto.getRandomValues(new Uint8Array(16)); // 초기화 벡터

  const encodedData = new TextEncoder().encode(data);

  const encrypted = btoa(
    String.fromCharCode(
      ...new Uint8Array(
        await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, encodedData),
      ),
    ),
  );

  // Key를 "raw" 형식으로 내보냄
  const exportKey = (await crypto.subtle.exportKey("raw", key)) as ArrayBuffer;

  // Base64로 변환
  const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportKey)));

  // iv를 Base64로 변환
  const ivBase64 = btoa(String.fromCharCode(...new Uint8Array(iv)));

  return { encrypted, key: keyBase64, iv: ivBase64 };
}
