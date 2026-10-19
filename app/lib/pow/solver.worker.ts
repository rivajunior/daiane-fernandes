import { findNonce } from "./shared";

self.onmessage = async (event: MessageEvent<{ salt: string; difficulty: number }>) => {
  const nonce = await findNonce(event.data.salt, event.data.difficulty);
  self.postMessage({ nonce });
};
