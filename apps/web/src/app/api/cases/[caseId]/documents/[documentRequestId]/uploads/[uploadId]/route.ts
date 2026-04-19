import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { operatorSessionCookieName, operatorSessionHeaderName } from "@real-estate-ai/contracts";
import { verifyOperatorSessionToken } from "@real-estate-ai/contracts/operator-session";

import { getWebApiBaseUrl } from "@/lib/live-api";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      caseId: string;
      documentRequestId: string;
      uploadId: string;
    }>;
  }
) {
  const { caseId, documentRequestId, uploadId } = await context.params;
  const cookieStore = await cookies();
  const storedSessionToken = cookieStore.get(operatorSessionCookieName)?.value;
  const headers = new Headers();

  if (verifyOperatorSessionToken(storedSessionToken)) {
    headers.set(operatorSessionHeaderName, storedSessionToken as string);
  }

  const response = await fetch(`${getWebApiBaseUrl()}/v1/cases/${caseId}/documents/${documentRequestId}/uploads/${uploadId}`, {
    cache: "no-store",
    headers,
    signal: AbortSignal.timeout(12000)
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");

    return new NextResponse(errorBody || "download_failed", {
      status: response.status
    });
  }

  const downloadHeaders = new Headers();
  const contentDisposition = response.headers.get("content-disposition");
  const contentLength = response.headers.get("content-length");
  const contentType = response.headers.get("content-type");

  if (contentDisposition) {
    downloadHeaders.set("content-disposition", contentDisposition);
  }

  if (contentLength) {
    downloadHeaders.set("content-length", contentLength);
  }

  if (contentType) {
    downloadHeaders.set("content-type", contentType);
  }

  return new NextResponse(response.body, {
    headers: downloadHeaders,
    status: 200
  });
}
