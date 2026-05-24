"use server"

import { redirect } from "next/navigation";
import { getSession, createSession, updateTokens } from "./session";
import { BACKEND_URL } from "./constant";
import {
  FormState,
  LoginFormSchema,
  SignupFormSchema,
} from "./type";
import { cookies } from "next/dist/server/request/cookies";

export async function signOut() {
  console.log("--- [Frontend: signOut] Triggered ---");

  try {
    const cookieStore = await cookies();
    const session = await getSession();

    if (session && session.accessToken) {
      console.log("--- [Frontend: signOut] Attempting to revoke access token for user.");
      try {
        const response = await fetch(`${BACKEND_URL}/auth/signout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.accessToken}`,
            "Content-Type": "application/json"
          }
        });
        console.log(`--- [Frontend: signOut] Backend Revoke Response Status: ${response.status}`);
        if (!response.ok) {
          const errorBody = await response.text().catch(() => "No response body");
          console.error(`--- [Frontend: signOut] ❌ Backend SignOut failed with status ${response.status}: ${errorBody}`);
        }
      } catch (fetchError) {
        console.error(`--- [Frontend: signOut] 🔥 Fetch error during backend signout: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
        console.error(fetchError);
      }
    } else {
      console.log("--- [Frontend: signOut] No active session or access token found for sign out.");
    }

    cookieStore.delete("session");
    console.log("--- [Frontend: signOut] ✅ Local session cookie deleted.");
  } catch (error) {
    console.error(`--- [Frontend: signOut] 🔥 General SignOut Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error(error);
  } finally {
    console.log("--- [Frontend: signOut] Redirecting to /auth/signin ---");
    redirect("/auth/signin");
  }
}

export async function signUp(state: FormState, formData: FormData): Promise<FormState> {
  console.log("--- [Frontend: signUp] Action Started ---");
  let isSuccessful = false;

  try {
    console.log("--- [Frontend: signUp] Validating form data ---");
    const validationFields = SignupFormSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validationFields.success) {
      console.warn("--- [Frontend: signUp] ⚠️ Validation Failed:", validationFields.error.flatten().fieldErrors);
      return { error: validationFields.error.flatten().fieldErrors };
    }
    console.log("--- [Frontend: signUp] ✅ Form data validated successfully ---");

    console.log(`--- [Frontend: signUp] Calling Backend SignUp API: ${BACKEND_URL}/auth/signup`);
    const response = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validationFields.data),
    });

    console.log(`--- [Frontend: signUp] Backend Status Code: ${response.status}`);
    console.log(`--- [Frontend: signUp] Backend Status Text: ${response.statusText}`);

    if (response.ok) {
      console.log("--- [Frontend: signUp] 🚀 Registration success!");
      isSuccessful = true;
    } else {
      const errorData = await response.json().catch(() => ({ message: "Unknown error from backend" }));
      console.error("--- [Frontend: signUp] ❌ Backend SignUp failed:", errorData);
      return {
        message: response.status === 409 ? "User exists!" : (errorData.message || "Registration failed"),
      };
    }
  } catch (error) {
    console.error(`--- [Frontend: signUp] 🔥 General SignUp Action Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error(error);
    return { message: "Something went wrong during sign up." };
  }

  if (isSuccessful) {
    console.log("--- [Frontend: signUp] Redirecting to /auth/signin after successful registration ---");
    redirect("/auth/signin");
  }
  return {}; // Should not be reached if redirect occurs, but good for type safety
}

export async function signIn(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  console.log("--- [Frontend: signIn] Action Started ---");
  console.log("--- [Frontend: signIn] Validating form data ---");
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    console.warn("--- [Frontend: signIn] ⚠️ Validation Failed:", validatedFields.error.flatten().fieldErrors);
    return {
      message: "Validation Error",
      error: validatedFields.error.flatten().fieldErrors,
    };
  }
  console.log("--- [Frontend: signIn] ✅ Form data validated successfully ---");

  try {
    console.log(`--- [Frontend: signIn] Calling Backend SignIn API: ${BACKEND_URL}/auth/signin`);
    const response = await fetch(`${BACKEND_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validatedFields.data),
    });
// ADD THIS LOG
  console.log('--- DEBUG: Attempting to connect to:',{BACKEND_URL});
  console.log('--- DEBUG: Is localhost the right host?', typeof window !== 'undefined' ? window.location.hostname : 'server');
    console.log(`--- [Frontend: signIn] Backend Status Code: ${response.status}`);
    console.log(`--- [Frontend: signIn] Backend Status Text: ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error from backend" }));
      console.error("--- [Frontend: signIn] ❌ Backend SignIn failed:", errorData);
      return {
        message: response.status === 401 ? "Invalid Credentials!" : (errorData.message || "Login failed"),
      };
    }

    const result = await response.json();
    console.log("--- [Frontend: signIn] ✅ Login successful, creating session...");

    await createSession({
      user: {
        id: result.id,
        name: result.name,
        role: result.role,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    console.log("--- [Frontend: signIn] ✅ Session created successfully.");

  } catch (error) {
    console.error(`--- [Frontend: signIn] 🔥 General SignIn Action Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error(error);
    return { message: "Server unreachable or connection error during sign in." };
  }

  console.log("--- [Frontend: signIn] Redirecting to /profile after successful login ---");
  redirect("/profile");
}

export async function refreshToken(token: string) {
  console.log("--- [Frontend: refreshToken] 🔄 Attempting to refresh token with:", token.substring(0, 10) + "...");

  try {
    console.log(`--- [Frontend: refreshToken] Calling Backend Refresh API: ${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token }),
    });

    console.log(`--- [Frontend: refreshToken] 📡 Refresh Response Status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "No response body" }));
      console.error("--- [Frontend: refreshToken] ❌ Refresh Token Server Error:", errorData);
      throw new Error(`Refresh failed with status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("--- [Frontend: refreshToken] ✅ New Tokens received successfully.");

    await updateTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    console.log("--- [Frontend: refreshToken] ✅ Session tokens updated.");

    return data.accessToken;
  } catch (error) {
    console.error(`--- [Frontend: refreshToken] 🚨 Critical Error in refreshToken function: ${error instanceof Error ? error.message : String(error)}`);
    console.error(error);
    throw error;
  }
}

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const authFetch = async (url: string, options: FetchOptions = {}) => {
  console.log(`--- [Frontend: authFetch] Initiating request to: ${url} ---`);
  const session = await getSession();

  const baseUrl = BACKEND_URL?.endsWith("/") ? BACKEND_URL?.slice(0, -1) : BACKEND_URL;
  const path = url.startsWith("/") ? url : `/${url}`;
  const fullUrl = `${baseUrl}${path}`;

  options.headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.accessToken}`,
  };

  try {
    console.log(`--- [Frontend: authFetch] 📡 Requesting: ${fullUrl}`);
    let response = await fetch(fullUrl, options);
    console.log(`--- [Frontend: authFetch] 📩 Initial response status: ${response.status}`);

    if (response.status === 401) {
      console.warn("--- [Frontend: authFetch] 🔑 401 Unauthorized Detected. Attempting to refresh token...");

      if (!session?.refreshToken) {
        console.error("--- [Frontend: authFetch] 🚫 No refresh token in session. Cannot refresh. Returning original 401.");
        // Optionally redirect to sign-in page here if refresh token is critical
        // redirect("/auth/signin");
        return response; // Return the original 401 response
      }

      try {
        console.log("--- [Frontend: authFetch] Calling refreshToken with existing refresh token.");
        const newAccessToken = await refreshToken(session.refreshToken);

        if (newAccessToken) {
          console.log("--- [Frontend: authFetch] 🔁 Token refreshed. Retrying request with new token...");
          options.headers.Authorization = `Bearer ${newAccessToken}`;
          response = await fetch(fullUrl, options); // Retry the original request
          console.log(`--- [Frontend: authFetch] 📩 Retried request status: ${response.status}`);
        } else {
          console.error("--- [Frontend: authFetch] ❌ Refresh token function returned no new access token. Returning original 401.");
          // redirect("/auth/signin"); // Consider redirecting if refresh failed silently
        }
      } catch (refreshErr) {
        console.error(`--- [Frontend: authFetch] 💀 Refresh flow totally failed: ${refreshErr instanceof Error ? refreshErr.message : String(refreshErr)}`);
        console.error(refreshErr);
        // redirect("/auth/signin"); // Redirect user to sign-in on critical refresh failure
        throw refreshErr; // Re-throw to propagate the error
      }
    }

    return response;
  } catch (globalErr) {
    console.error(`--- [Frontend: authFetch] 🌍 Network/Unknown Error during fetch: ${globalErr instanceof Error ? globalErr.message : String(globalErr)}`);
    console.error(globalErr);
    throw globalErr;
  }
};
