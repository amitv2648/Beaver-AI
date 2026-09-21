import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  app: {},
  auth: {},
  getApps: vi.fn((): object[] => []),
  getApp: vi.fn(),
  initializeApp: vi.fn(() => ({})),
  getAuth: vi.fn(() => ({})),
  setPersistence: vi.fn().mockResolvedValue(undefined),
  connectAuthEmulator: vi.fn(),
  browserLocalPersistence: { type: "LOCAL" },
}));

vi.mock("firebase/app", () => ({
  getApp: mocks.getApp,
  getApps: mocks.getApps,
  initializeApp: mocks.initializeApp,
}));

vi.mock("firebase/auth", () => ({
  browserLocalPersistence: mocks.browserLocalPersistence,
  connectAuthEmulator: mocks.connectAuthEmulator,
  getAuth: mocks.getAuth,
  setPersistence: mocks.setPersistence,
}));

describe("Firebase client configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "public-api-key");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "beaver.test");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "beaver-test");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "app-id");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST", "");
  });

  it("uses durable local session persistence", async () => {
    const { configureFirebaseAuth } = await import("./client");
    await configureFirebaseAuth();

    expect(mocks.initializeApp).toHaveBeenCalledWith({
      apiKey: "public-api-key",
      authDomain: "beaver.test",
      projectId: "beaver-test",
      appId: "app-id",
    });
    expect(mocks.setPersistence).toHaveBeenCalledWith(
      expect.anything(),
      mocks.browserLocalPersistence,
    );
  });

  it("connects to the explicitly configured emulator", async () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST", "127.0.0.1:9099");
    const { configureFirebaseAuth } = await import("./client");
    await configureFirebaseAuth();

    expect(mocks.connectAuthEmulator).toHaveBeenCalledWith(
      expect.anything(),
      "http://127.0.0.1:9099",
      { disableWarnings: true },
    );
  });
});
