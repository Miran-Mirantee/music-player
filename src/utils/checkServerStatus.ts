import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const checkServerStatus = async () => {
  let isReady = false;
  while (!isReady) {
    try {
      const response = await axios.get(`${baseUrl}/health-check`);
      if (response.status == 200) {
        isReady = true;
        // Proceed with your main request or app logic
        return true;
      } else {
        return false;
        // throw new Error("Server not ready");
      }
    } catch (error) {
      console.log("Waiting for server to wake up...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // wait for 2 seconds before retrying
    }
  }
};

export default checkServerStatus;
