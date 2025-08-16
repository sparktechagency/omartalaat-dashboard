// Use Web Crypto API for decryption in the browser
export async function decryptUrl(encryptedUrl, secret) {
  // Ensure the secret is exactly 32 bytes (same as for encryption)
  const keyBuffer = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  // Split the IV and encrypted data
  const [ivString, encrypted] = encryptedUrl.split(":");

  // Convert IV and encrypted data to proper formats
  const iv = hexToBuffer(ivString); // Helper function to convert hex to buffer
  const encryptedBuffer = hexToBuffer(encrypted);

  try {
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: iv },
      keyBuffer,
      encryptedBuffer
    );

    // Convert the decrypted buffer back to a string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    console.error("Decryption failed", err);
    return "";
  }
}

// Helper function to convert hex string to ArrayBuffer
function hexToBuffer(hex) {
  const typedArray = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    typedArray[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return typedArray.buffer;
}
