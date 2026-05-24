import api from "./api";

export type AppNotification = {
  id: number;
  is_read?: boolean;
  title?: string;
  message?: string;
};

const getOwnerNotifications = async (): Promise<{ notifications: AppNotification[] }> => {
  try {
    const data = await api.get("/notifications");

    if (Array.isArray(data)) {
      return { notifications: data as AppNotification[] };
    }

    if (Array.isArray(data?.notifications)) {
      return { notifications: data.notifications as AppNotification[] };
    }

    return { notifications: [] };
  } catch (error) {
    console.error("[notificationService] failed to fetch notifications", error);
    return { notifications: [] };
  }
};

const notificationService = {
  getOwnerNotifications,
};

export default notificationService;
