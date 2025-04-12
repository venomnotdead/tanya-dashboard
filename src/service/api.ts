import { getAccessToken } from "./auth";
import axios from "axios";

export const fetchStoreConfig = async (storeCode: string) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_BASE_URL}api/logo?storeCode=${storeCode}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error fetching logo details:", error);
  }
};
