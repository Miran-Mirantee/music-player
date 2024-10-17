import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const getMusic = async (url: string) => {
  try {
    const response = await axios.get(`${baseUrl}/api/youtube`, {
      responseType: "blob",
      params: { url },
    });
    const audio = URL.createObjectURL(response.data);
    return audio;
  } catch (error) {
    throw error;
  }
};

export default getMusic;
