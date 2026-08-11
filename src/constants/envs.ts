export default {
  mode: process.env.EXPO_PUBLIC_ENV || "production",
  server_auth_token: process.env.EXPO_PUBLIC_API_KEY,
  google_web_client_id: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};
