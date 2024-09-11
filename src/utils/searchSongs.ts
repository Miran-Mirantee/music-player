import axios from "axios";

const searchSongs = async (query: string) => {
  try {
    const response = await axios.get("http://localhost:3000/api/searchSongs", {
      params: { search: query },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export default searchSongs;
