import Constants from 'expo-constants';

function resolveExpoHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(':')[0];
}

const expoHost = resolveExpoHost();

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (expoHost ? `http://${expoHost}:8000/api` : 'http://127.0.0.1:8000/api');
