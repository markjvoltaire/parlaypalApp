import { Platform } from "react-native";
import Constants from "expo-constants";

const PRODUCTION_URL = "https://parlaypal.onrender.com";
const DEV_PORT = 6000;

function getDevApiUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_PARLAY_API_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${DEV_PORT}`;
  }

  const debuggerHost =
    Constants.expoConfig?.hostUri?.split(":")[0] ??
    Constants.expoGoConfig?.debuggerHost?.split(":")[0];

  if (
    debuggerHost &&
    debuggerHost !== "localhost" &&
    debuggerHost !== "127.0.0.1"
  ) {
    return `http://${debuggerHost}:${DEV_PORT}`;
  }

  return `http://localhost:${DEV_PORT}`;
}

const PARLAY_API_URL = __DEV__ ? getDevApiUrl() : PRODUCTION_URL;

if (__DEV__) {
  console.log("[Parlay API] Using", PARLAY_API_URL);
}

export default PARLAY_API_URL;
