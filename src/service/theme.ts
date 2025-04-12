import axios from "axios";
import { getAccessToken } from "./auth";

export const getTheme = async (storeCode: string) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}api/theme?storeCode=${storeCode}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching theme:", error);
    return null;
  }
};
