import { render, screen, fireEvent, renderHook } from "@testing-library/react";
import "@testing-library/jest-dom";
import SettingsPage from "../settings";
import { useThemeStore } from "@/store/themeStore";
import { globalIpcRendererMock } from "@/tests/mocks/electron";

jest.mock("@/store/themeStore", () => ({
  useThemeStore: jest.fn(() => ({ theme: { custom: "light", os: true }, setTheme: jest.fn() })),
}));

jest.mock("zustand/middleware", () => ({
  ...jest.requireActual("zustand/middleware"),
  createJSONStorage: jest.fn(() => jest.fn()),
}));

jest.mock("zustand/traditional", () => ({
  createWithEqualityFn: jest.fn(() => jest.fn()),
}));

jest.mock("@/store/themeStore", () => ({
  useThemeStore: jest.fn(() => ({ theme: {}, setTheme: jest.fn() })),
}));

jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

global.ipcRenderer = {
  on: jest.fn(),
  removeAllListeners: jest.fn(),
  send: jest.fn(),
  ...globalIpcRendererMock,
};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("GIVEN SettingsPage", () => {
  beforeAll(() => {
    render(<SettingsPage />);

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();

    global.ipcRenderer = globalIpcRendererMock;
  });

  it("renders SettingsPage correctly", () => {
    const { result } = renderHook(() => useThemeStore());

    expect(result.current.theme).toEqual({});

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Manage your settings and set preferences")).toBeInTheDocument();
  });

  it("handles theme change correctly", () => {
    const mockUseThemeStore = jest.fn(() => [{ theme: { os: true, custom: "dark" } }, jest.fn()]);
    jest.mock("@/store/themeStore", () => ({
      useThemeStore: mockUseThemeStore,
    }));

    expect(document.body.className).toBe("light bg-grey-100");

    fireEvent(window, new Event("resize"));

    setTimeout(() => {
      expect(document.body.className).toBe("light bg-grey-100");
    }, 0);
  });
});
