import axios from "axios";

const searchVideos = async (query: string) => {
  try {
    const response = await axios.get("http://localhost:3000/api/searchVideos", {
      params: { search: query },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export default searchVideos;
