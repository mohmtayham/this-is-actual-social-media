"use server";

import { getSession, updateTokens } from "./session"; // تأكد من المسار الصحيح لملف session.ts
import { BACKEND_URL } from "./constant"; // تأكد من المسار الصحيح لملف constant.ts
import { redirect } from "next/navigation";

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const authFetch = async (url: string, options: FetchOptions = {}) => {
  console.log(`--- [Server Action: authFetch] 🌐 Initiating request to: ${url} ---`);
  let session;
  try {
    session = await getSession();
    console.log(`--- [Server Action: authFetch] ✅ Session retrieved. User ID: ${session?.user?.id || 'N/A'} ---`);
  } catch (sessionError) {
    console.error(`--- [Server Action: authFetch] 🔥 Error getting session: ${sessionError instanceof Error ? sessionError.message : String(sessionError)}`);
    console.error(sessionError);
    // إذا فشل الحصول على الجلسة تمامًا، قد يكون من الأفضل إعادة التوجيه
    redirect("/auth/signin");
  }

  const baseUrl = BACKEND_URL?.endsWith("/") ? BACKEND_URL?.slice(0, -1) : BACKEND_URL;
  const path = url.startsWith("/") ? url : `/${url}`;
  const fullUrl = `${baseUrl}${path}`;

  options.headers = {
    ...options.headers,
    "Content-Type": "application/json",
    ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
  };
  options.cache = "no-store";

  try {
    console.log(`--- [Server Action: authFetch] 📡 Sending request to: ${fullUrl} with headers: ${JSON.stringify(options.headers)} ---`);
    let response = await fetch(fullUrl, options);
    console.log(`--- [Server Action: authFetch] 📩 Initial response status: ${response.status} for ${fullUrl} ---`);

    if (response.status === 401) {
      console.warn("--- [Server Action: authFetch] 🔑 401 Unauthorized Detected. Attempting to refresh token... --- ");

      if (!session?.refreshToken) {
        console.error("--- [Server Action: authFetch] 🚫 No refresh token in session. Cannot refresh. Redirecting to signin. --- ");
        redirect("/auth/signin");
      }

      try {
        console.log("--- [Server Action: authFetch] Calling refreshToken with existing refresh token. --- ");
        const refreshResponse = await fetch(`${BACKEND_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: session.refreshToken }),
        });

        console.log(`--- [Server Action: authFetch] 📡 Refresh Response Status: ${refreshResponse.status} ---`);

        if (!refreshResponse.ok) {
          const refreshErrorData = await refreshResponse.json().catch(() => ({ message: "No response body from refresh" }));
          console.error(`--- [Server Action: authFetch] ❌ Refresh Token Server Error: ${JSON.stringify(refreshErrorData)} ---`);
          redirect("/auth/signin"); // Redirect on refresh failure
        }

        const refreshData = await refreshResponse.json();
        console.log("--- [Server Action: authFetch] ✅ New Tokens received successfully. --- ");

        await updateTokens({
          accessToken: refreshData.accessToken,
          refreshToken: refreshData.refreshToken,
        });
        console.log("--- [Server Action: authFetch] ✅ Session tokens updated. --- ");

        // Retry the original request with the new access token
        options.headers.Authorization = `Bearer ${refreshData.accessToken}`;
        console.log(`--- [Server Action: authFetch] 🔁 Retrying original request to: ${fullUrl} with new token. --- `);
        response = await fetch(fullUrl, options);
        console.log(`--- [Server Action: authFetch] 📩 Retried request status: ${response.status} for ${fullUrl} ---`);

      } catch (refreshErr) {
        console.error(`--- [Server Action: authFetch] 💀 Refresh flow totally failed: ${refreshErr instanceof Error ? refreshErr.message : String(refreshErr)} ---`);
        console.error(refreshErr);
        redirect("/auth/signin"); // Redirect user to sign-in on critical refresh failure
      }
    }

    // Handle non-OK responses after potential refresh
    if (!response.ok) {
      const errorBody = await response.text().catch(() => "No response body");
      console.error(`--- [Server Action: authFetch] ❌ Final fetch not OK. Status: ${response.status}, Body: ${errorBody} ---`);
      // Attempt to parse JSON error if available, otherwise throw generic error
      try {
        const errorJson = JSON.parse(errorBody);
        throw new Error(errorJson.message || `API error: ${response.status}`);
      } catch (parseError) {
        throw new Error(`API error: ${response.status} - ${errorBody}`);
      }
    }

    return response;
  } catch (globalErr) {
    console.error(`--- [Server Action: authFetch] 🌍 Network/Unknown Error during fetch to ${fullUrl}: ${globalErr instanceof Error ? globalErr.message : String(globalErr)} ---`);
    console.error(globalErr);
    throw globalErr;
  }
};
