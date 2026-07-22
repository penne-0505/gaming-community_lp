import { vi } from "vitest";

export function mockFetchOnce(response: Response) {
  const fn = vi.fn().mockResolvedValue(response);
  globalThis.fetch = fn as typeof fetch;
  return fn;
}

export function mockFetchSequence(responses: Response[]) {
  const fn = vi.fn();
  responses.forEach((response) => fn.mockResolvedValueOnce(response));
  globalThis.fetch = fn as typeof fetch;
  return fn;
}

export function mockConsole() {
  const info = vi.spyOn(console, "log").mockImplementation(() => {});
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  return { info, warn, error };
}
