# Environment Setup

This app uses environment variables to store sensitive configuration like API keys.

## Setup Instructions

1. **Create a `.env` file** in the root directory of your project
2. **Add your environment variables** to the `.env` file:

```bash
# RevenueCat API Key
REVENUECAT_API_KEY=your_actual_revenuecat_api_key_here

# Backend API URL
API_URL=https://parlaypal.onrender.com

# Supabase Configuration
SUPABASE_URL=https://scrcmhbtcotkjuqbkcit.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Security Notes

- The `.env` file is already added to `.gitignore` to prevent committing sensitive data
- Never commit your actual API keys to version control
- The `config.js` file contains fallback values for development, but you should use environment variables in production

## Current Configuration

The app is configured to use environment variables with fallbacks:

- `REVENUECAT_API_KEY`: Your RevenueCat public API key
- `API_URL`: Your backend API URL
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## For Production

In production environments, make sure to:

1. Set up proper environment variables on your deployment platform
2. Remove any hardcoded API keys from the codebase
3. Use different API keys for development and production environments
