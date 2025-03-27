export default async function decryptData(
  encrypted: string,
  keyBase64: string,
  ivBase64: string,
) {
  // Base64 문자열을 Uint8Array로 변환
  const encryptedBytes = new Uint8Array(
    atob(encrypted)
      .split("")
      .map((c) => c.charCodeAt(0)),
  );

  // Base64를 디코딩하여 Uint8Array로 변환
  const keyBuffer = new Uint8Array(
    atob(keyBase64)
      .split("")
      .map((c) => c.charCodeAt(0)),
  );

  // 'raw' 형식으로 CryptoKey를 가져오기
  const key = await crypto.subtle.importKey(
    "raw", // raw 형식으로 가져옴
    keyBuffer.buffer, // ArrayBuffer로 전달
    { name: "AES-CBC" }, // 알고리즘 정보
    true, // 키를 재사용 가능하게
    ["encrypt", "decrypt"], // 키의 용도
  );

  // iv 복원 (Base64 -> Uint8Array)
  const iv = new Uint8Array(
    atob(ivBase64)
      .split("")
      .map((c) => c.charCodeAt(0)),
  );

  // AES-CBC 복호화
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    encryptedBytes,
  );

  // 복호화된 데이터를 텍스트로 변환
  return new TextDecoder().decode(decryptedBuffer);
}
