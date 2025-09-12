export type Bindings = {
  DB: D1Database;
  ASSETS: Fetcher;
  NODE_ENV: "development" | "production" | "test";
  VITE_PORT: string;
};
