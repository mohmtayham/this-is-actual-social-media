// This module performs authenticated server-side withdrawal requests.
// Why server-only is preferred here:
// - It is a server utility called from server contexts, not a direct client-called action.
// - server-only enforces the security boundary and avoids accidental browser imports.
import "server-only";

import { authFetch } from "@/lib/authFetch";

export const requestWithdrawal = async (ideaId: string, reason: string) => {
  return await authFetch("/withdrawals", {
    method: "POST",
    body: JSON.stringify({ idea_id: ideaId, reason }),
  });
};

export const getWithdrawalHistory = async () => {
  const data = await authFetch("/withdrawals");
  return data.withdrawals;
};

export const executeWithdrawalPayment = async (id: string) => {
  return await authFetch(`/withdrawals/${id}/execute`, {
    method: "POST",
  });
};