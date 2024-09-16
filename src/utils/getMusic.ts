import axios from "axios";

const getMusic = async (url: string) => {
  try {
    const response = await axios.get("http://localhost:3000/api/youtube", {
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
