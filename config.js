// Configuration file for API keys and sensitive data
// In production, these should be stored as environment variables
import {
  REVENUECAT_API_KEY,
  API_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_KEY,
} from "@env";

export const config = {
  // RevenueCat API Key
  REVENUECAT_API_KEY: REVENUECAT_API_KEY,

  // Backend API URL
  API_URL: API_URL,
  SUPABASE_KEY: SUPABASE_KEY,

  // Supabase Configuration
  SUPABASE_URL: SUPABASE_URL,
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  // Add other configuration values here as needed
};

// Note: For production, create a .env file and use:
// REVENUECAT_API_KEY=your_actual_api_key_here
// API_URL=your_actual_api_url_here
//
// IMPORTANT: The REVENUECAT_API_KEY must be set in your .env file
// as there is no fallback value for security reasons.
