import crypto from "crypto";

export function verifySignature(body, signature) {
  const hash = crypto
    .createHmac("SHA256", process.env.LINE_CHANNEL_SECRET)
    .update(body)
    .digest("base64");

  return hash === signature;
}
