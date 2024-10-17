import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const searchVideos = async (query: string) => {
  try {
    const response = await axios.get(`${baseUrl}/api/searchVideos`, {
      params: { search: query },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export default searchVideos;
