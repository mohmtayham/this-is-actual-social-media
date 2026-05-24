import api from "./api";

export type WalletSummary = {
  balance: number;
  currency?: string;
};

type WalletApiShape = {
  balance?: number;
  currency?: string;
  wallet?: {
    balance?: number;
    currency?: string;
  };
};

const parseWallet = (data: WalletApiShape | null | undefined): WalletSummary | null => {
  if (!data) return null;

  if (typeof data?.balance === "number") {
    return { balance: data.balance, currency: data.currency || "SPY" };
  }

  if (typeof data?.wallet?.balance === "number") {
    return { balance: data.wallet.balance, currency: data.wallet.currency || "SPY" };
  }

  return null;
};

const getMyWallet = async (): Promise<WalletSummary | null> => {
  const endpoints = ["/wallets/me", "/my_wallet", "/wallets"];

  for (const endpoint of endpoints) {
    try {
      const data = await api.get(endpoint);
      const wallet = parseWallet(data);
      if (wallet) return wallet;
    } catch {
      // Try next endpoint shape.
    }
  }

  return null;
};

const walletService = {
  getMyWallet,
};

export default walletService;
