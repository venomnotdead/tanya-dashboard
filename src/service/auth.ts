import axios from "axios";

export const getAccessToken = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_BASE_URL}api/auth/token`
    );
    return response.data.access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching token:", error.response || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};
