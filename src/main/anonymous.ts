import { randomBytes } from "node:crypto";

import type { NetworkFetchRequest } from "./calls/network";
import { deserialData, encodeAnonymousId } from "./crypto";
import client from "./request";

const MAX_ANONYMOUS_REGISTER_ATTEMPTS = 10;

function createAnonymousUsername() {
  const id = randomBytes(26).toString("hex").toUpperCase();
  return Buffer.from(`${id} ${encodeAnonymousId(id)}`, "utf8").toString(
    "base64"
  );
}

function isAnonymousRegisterRequest(url: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.endsWith("music.163.com") &&
      parsed.pathname.endsWith("api/register/anonimous")
    );
  } catch {
    return false;
  }
}

type Response = {
  blob: string;
  retryTimes: number;
  headers: Record<string, string>;
  status: number;
};

export default async function interceptAnonymousRequest(
  request: NetworkFetchRequest
): Promise<[Response | Error, number, number] | null> {
  if (!isAnonymousRegisterRequest(request.url)) return null;

  let sucCount = 0,
    failCount = 0;

  async function doRequest(request: NetworkFetchRequest): Promise<Response> {
    const response = await client(request.url, {
      method: request.method,
      headers: {
        ...request.headers,
      },
      body: request.body || undefined,
      throwHttpErrors: false,
      retry: {
        limit: request.retryCount,
        backoffLimit: 10000,
      },
      hooks: {
        beforeRetry: [
          () => {
            sucCount++;
          },
        ],
      },
    });

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(response.headers)) {
      if (Array.isArray(value)) {
        headers[key] = value.join(", ");
      } else if (value !== undefined) {
        headers[key] = value;
      }
    }

    const responseBody = Buffer.from(response.rawBody);
    const blob = request.isDecrypt
      ? deserialData(
          responseBody.buffer.slice(
            responseBody.byteOffset,
            responseBody.byteOffset + responseBody.byteLength
          )
        )
      : responseBody.toString();

    failCount++;

    return {
      blob,
      retryTimes: 0,
      headers,
      status: response.statusCode,
    };
  }

  try {
    // Let's do the first request directly
    const res = await doRequest(request);

    const resJson = JSON.parse(res.blob);
    if (resJson.code === 400) {
      // Oops, failed, run the attempts
      request.url = "https://music.163.com/api/register/anonimous";
      for (
        let attempt = 2;
        attempt < MAX_ANONYMOUS_REGISTER_ATTEMPTS;
        attempt++
      ) {
        request.body = new URLSearchParams({
          username: createAnonymousUsername(),
        }).toString();
        const res = await doRequest(request);
        const resJson = JSON.parse(res.blob);
        if (resJson.code === 400) continue;
        return [res, sucCount, failCount];
      }
    }

    return [res, sucCount, failCount];
  } catch (err) {
    let e: Error;
    if (err instanceof Error) {
      e = err;
    } else {
      e = new Error(String(err));
    }
    return [e, sucCount, failCount];
  }
}
