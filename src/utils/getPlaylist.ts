import axios from "axios";

const getPlaylist = async (query: string) => {
  try {
    const response = await axios.get("http://localhost:3000/api/getPlaylist", {
      params: { playlistId: query },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export default getPlaylist;
