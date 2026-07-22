import type { Env, PagesContext } from "../../functions/types";

export function createRequest({
  url = "https://example.com",
  method = "GET",
  headers = {},
  body,
  json,
}: {
  url?: string;
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  json?: unknown;
} = {}): Request {
  const init: RequestInit = { method, headers: new Headers(headers) };

  if (json !== undefined) {
    init.body = JSON.stringify(json);
    (init.headers as Headers).set("Content-Type", "application/json");
  } else if (body !== undefined) {
    init.body = body;
  }

  return new Request(url, init);
}

export function createJsonResponse(
  body: unknown,
  { status = 200, headers = {} }: { status?: number; headers?: Record<string, string> } = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function createTextResponse(
  body: BodyInit | null,
  { status = 200, headers = {} }: { status?: number; headers?: Record<string, string> } = {}
): Response {
  return new Response(body, { status, headers });
}

export function createContext({
  request,
  env,
  next,
}: {
  request?: Request;
  env?: Env;
  next?: () => Promise<Response> | Response;
} = {}): PagesContext {
  return {
    request: request as Request,
    env: (env ?? {}) as Env,
    next: next || (() => Promise.resolve(new Response("next"))),
    functionPath: "",
    waitUntil: () => undefined,
    passThroughOnException: () => undefined,
    params: {},
    data: {},
  } as unknown as PagesContext;
}

export async function readJson<T = unknown>(response: Response): Promise<T> {
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function readText(response: Response): Promise<string> {
  return response.text();
}
