import api from "./api";
import { authFetch } from "@/lib/authFetch";

const addIdea = async (ideaData: any) => {
  const res = await authFetch("/ideas", {
    method: "POST",
    body: JSON.stringify(ideaData),
  });

  if (!res.ok) {
    throw new Error("Failed to submit idea");
  }

  return res.json();
};
const getMyIdeas = async () => {
  return await api.get("/ideas/my-ideas");
};

const updateIdea = async (ideaId: string, ideaData: any) => {
  try {
    return await api.put(`/ideas/${ideaId}`, ideaData);
  } catch (err: any) {
    console.error("Error updating idea:", err);
    throw err || { message: "Failed to update idea" };
  }
};

export default { addIdea, updateIdea, getMyIdeas };