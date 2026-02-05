// 

// @ts-check
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: "html",

  use: {
    viewport: null, // Required for maximized mode
    headless: false,
    trace: "on-first-retry",
    launchOptions: {
      args: ["--start-maximized"],
    },
  },

  projects: [
    {
      name: "Chromium",
      use: { browserName: "chromium" },
    },
    {
      name: "Firefox",
      use: { browserName: "firefox" },
    },
    {
      name: "WebKit",
      use: { browserName: "webkit" },
    },
  ],
});
