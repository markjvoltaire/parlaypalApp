import Purchases from "react-native-purchases";
import { REVENUECAT_API_KEY } from "../src/config/env";

let configured = false;

export function configureRevenueCat() {
  if (configured) return;

  if (!REVENUECAT_API_KEY) {
    console.warn(
      "[RevenueCat] Set EXPO_PUBLIC_REVENUECAT_API_KEY (or platform-specific iOS/Android keys) in .env",
    );
    return;
  }

  Purchases.configure({ apiKey: REVENUECAT_API_KEY });
  configured = true;
}
