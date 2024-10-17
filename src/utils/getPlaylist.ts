import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const getPlaylist = async (query: string) => {
  try {
    const response = await axios.get(`${baseUrl}/api/getPlaylist`, {
      params: { playlistId: query },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default getPlaylist;
