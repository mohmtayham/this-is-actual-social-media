"use server";

import { authFetch } from "./authFetch";
// قم بتغيير 'constants' إلى 'constant'
import { BACKEND_URL } from "./constant";

import { getSession } from "./session";

export const getProfile = async () => {
  // const session = await getSession();
  // const response = await fetch(`${BACKEND_URL}/auth/protected`, {
  //   headers: {
  //     authorization: `Bearer ${session?.accessToken}`,
  //   },
  // });

  const response = await authFetch(`${BACKEND_URL}/auth/protected`);

  const result = await response.json();
  return result;
};

export async function submitIdeaAction(ideaData: any) {
  console.log("--- [Server Action: submitIdea] Started ---");
  
  try {
    // We use your custom authFetch here! It handles tokens automatically.
    const response = await authFetch("/ideas", {
      method: "POST",
      body: JSON.stringify(ideaData),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      console.error(`--- [Server Action: submitIdea] ❌ Failed: ${response.status} - ${errorBody} ---`);
      
      // Try to parse the backend JSON error, otherwise throw standard error
      let errorMessage = "Failed to submit idea";
      try {
        const parsedError = JSON.parse(errorBody);
        errorMessage = parsedError.message || errorMessage;
      } catch (e) {}

      return { success: false, message: errorMessage };
    }

    const result = await response.json();
    console.log("--- [Server Action: submitIdea] ✅ Success! ---");
    
    return { 
      success: true, 
      message: result.message || "Idea submitted successfully!",
      idea: result.idea // Assuming your backend returns the created idea object
    };
    
  } catch (error: any) {
    console.error("--- [Server Action: submitIdea] 🔥 Exception:", error);
    return { 
      success: false, 
      message: error.message || "Network or server error occurred." 
    };
  }
}
