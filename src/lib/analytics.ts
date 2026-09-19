import PostHog from "posthog-react-native";

type AnalyticsValue = boolean | number | string;
type AnalyticsProperties = Record<string, AnalyticsValue | undefined>;

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;

const posthog = apiKey
  ? new PostHog(apiKey, {
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      captureAppLifecycleEvents: true,
      disableGeoip: true,
    })
  : null;

const withoutUndefined = (properties: AnalyticsProperties): Record<string, AnalyticsValue> => {
  const cleanProperties: Record<string, AnalyticsValue> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined) cleanProperties[key] = value;
  }
  return cleanProperties;
};

export const trackEvent = (event: string, properties: AnalyticsProperties = {}) => {
  posthog?.capture(event, withoutUndefined(properties));
};

export const identifyAnalyticsUser = (userId: string) => {
  posthog?.identify(userId);
};

export const resetAnalyticsUser = () => {
  posthog?.reset();
};

export const trackScreenView = (screen: string) => {
  trackEvent("screen_viewed", { screen });
};

export const durationBucket = (seconds: number) => {
  if (seconds < 5 * 60) return "under_5_minutes";
  if (seconds < 15 * 60) return "5_to_14_minutes";
  if (seconds < 30 * 60) return "15_to_29_minutes";
  if (seconds < 60 * 60) return "30_to_59_minutes";
  return "60_minutes_or_more";
};
