import axios from "axios";

const getPlaylistVideos = async (query: string) => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/getPlaylistVideos",
      {
        params: { playlistId: query },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default getPlaylistVideos;
