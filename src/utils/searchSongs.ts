import axios from "axios";
import checkServerStatus from "./checkServerStatus";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const searchSongs = async (query: string) => {
  try {
    const status = await checkServerStatus();
    if (!status) return;
    const response = await axios.get(`${baseUrl}/api/searchSongs`, {
      params: { search: query },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export default searchSongs;
