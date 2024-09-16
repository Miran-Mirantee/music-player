import axios from "axios";

const searchPlaylists = async (query: string) => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/searchPlaylists",
      {
        params: { search: query },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default searchPlaylists;
