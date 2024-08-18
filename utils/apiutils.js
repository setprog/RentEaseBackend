//this is for session creation using jwt
import AsyncStorage from "@react-native-async-storage/async-storage";

const fetchUserData = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const response = await fetch("http://10.139.174.46:8000/userData", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok)
      throw new Error(result.message || "Failed to fetch user data");

    return result;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export default fetchUserData;
