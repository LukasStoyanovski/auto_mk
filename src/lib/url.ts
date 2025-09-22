// file: src/lib/url.ts
export function baseUrl() {
    return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  }
  