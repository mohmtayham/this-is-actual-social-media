import api from "./api";
import { BACKEND_URL } from "@/lib/constant";

export type SlideItem = {
  id?: number;
  image: string;
  title?: string;
};

type SlideApiItem = {
  id?: number;
  title?: string;
  image?: string;
};

type SlidesResponse = SlideApiItem[] | { slides?: SlideApiItem[] };

const toAbsolute = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_URL}/${path.replace(/^\/+/, "")}`;
};

const getSlides = async (): Promise<SlideItem[]> => {
  try {
    const data = (await api.get("/admin/contents/index?type=slide")) as SlidesResponse;
    const list = Array.isArray(data) ? data : data?.slides || [];

    return list
      .map((item: SlideApiItem) => ({
        id: item.id,
        title: item.title,
        image: toAbsolute(item.image || ""),
      }))
      .filter((item: SlideItem) => item.image);
  } catch (error) {
    console.error("[contentService] failed to fetch slides", error);
    return [];
  }
};

const contentService = {
  getSlides,
};

export default contentService;
