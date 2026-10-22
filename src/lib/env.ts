import "server-only";

export const env = {
  demoMode: (process.env.NEXT_PUBLIC_DEMO_MODE ?? "true") !== "false",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  appSecret: process.env.APP_SECRET ?? "dev-secret-change-me",
  adminEmail: (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD ?? "change-me-now",
  storageDriver: process.env.STORAGE_DRIVER ?? "local",
  firebase: {
    enabled: Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL),
    projectId: process.env.FIREBASE_PROJECT_ID ?? "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  },
  stripe: {
    enabled: Boolean(process.env.STRIPE_SECRET_KEY),
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
  },
  llm: {
    enabled: Boolean(process.env.OPENAI_API_KEY),
    apiKey: process.env.OPENAI_API_KEY ?? "",
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  },
  pose: {
    enabled: Boolean(process.env.POSE_SERVICE_URL),
    url: process.env.POSE_SERVICE_URL ?? "",
  },
};

export const PRICE_REVIEW_CENTS = 1900;
