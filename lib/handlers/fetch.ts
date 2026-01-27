import { ActionResponse } from "@/types/global";
import { RequestError } from "../http-errors";
import logger from "../logger";
import handleError from "./error";
// Fetch handler for the server

export interface FetchOptions extends RequestInit {
  timeout?: number; // Timeout in milliseconds
}

//Helper function error is instance of Error
function isError(err: unknown): err is Error {
  return err instanceof Error;
}

/**
 * Handles fetch requests with configurable timeout and error handling.
 *
 * @template T - The type of the data expected in the response.
 * @param {string} url - The URL to send the fetch request to.
 * @param {FetchOptions} [options={}] - The fetch options, including headers and timeout.
 * @returns {Promise<ActionResponse<T>>} - A promise that resolves to an ActionResponse containing the data or error.
 */
export async function fetchHandler<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ActionResponse<T>> {
  const { timeout = 5000, headers: customHeaders = {}, ...restOptions } = options;
  const controller = new AbortController(); // abort controller for timeout

  const id = setTimeout(() => controller.abort(), timeout); // Default timeout is 5 seconds

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const headers: HeadersInit = { ...defaultHeaders, ...customHeaders };
  const config: RequestInit = {
    ...restOptions,
    headers,
    signal: controller.signal, // Attach the abort signal
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(id); // Clear the timeout if fetch is successful

    if (!response.ok) {
      throw new RequestError(response.status, `Http request failed with status ${response.status}`);
    }

    return (await response.json()) as ActionResponse<T>;
  } catch (err) {
    const error = isError(err) ? err : new Error("An unknown error occurred");

    if (error.name === "AbortError") {
      logger.warn(`Fetch request to ${url} timed out after ${timeout}ms`);
    } else {
      logger.error(`Fetch request to ${url} failed: ${error.message}`);
    }
    return handleError(error) as ActionResponse<T>;
  }
}
