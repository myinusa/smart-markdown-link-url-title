import { parse } from "node-html-parser";
import fetch from "node-fetch";
// Use the global AbortController which is available in modern Node.js

/**
 * Default timeout for URL requests in milliseconds
 */
const DEFAULT_TIMEOUT = 5000;

/**
 * Error types for title fetching
 */
export enum TitleFetchError {
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  PARSING_ERROR = "PARSING_ERROR",
  NOT_FOUND = "NOT_FOUND",
  INVALID_URL = "INVALID_URL",
}

/**
 * Result of a title fetch operation
 */
export interface TitleFetchResult {
  url: string;
  title: string | null;
  error?: TitleFetchError;
  errorMessage?: string;
}

/**
 * Options for fetching titles
 */
export interface TitleFetchOptions {
  timeout?: number;
  userAgent?: string;
}

/**
 * Fetches the HTML content from a URL
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns The HTML content as a string
 * @throws Error if the fetch fails
 */
async function fetchHtml(url: string, options: TitleFetchOptions = {}): Promise<string> {
  const { timeout = DEFAULT_TIMEOUT, userAgent = "VSCode-Extension/1.0" } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extracts the title from HTML content
 * @param html The HTML content
 * @returns The extracted title or null if not found
 */
export function extractTitleFromHtml(html: string): string | null {
  try {
    const root = parse(html);
    const titleElement = root.querySelector("title");
    const title = titleElement ? titleElement.text.trim() : "";

    if (!title) {
      // Try to find an h1 if no title is available
      const h1Element = root.querySelector("h1");
      const h1 = h1Element ? h1Element.text.trim() : "";
      return h1 || null;
    }

    return title;
  } catch (error) {
    return null;
  }
}

/**
 * Fetches the title of a webpage from a URL
 * @param url The URL to fetch the title from
 * @param options Options for the fetch operation
 * @returns A promise that resolves to a TitleFetchResult
 */
export async function fetchTitle(url: string, options: TitleFetchOptions = {}): Promise<TitleFetchResult> {
  try {
    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return {
        url,
        title: null,
        error: TitleFetchError.INVALID_URL,
        errorMessage: "Invalid URL format",
      };
    }

    // Fetch HTML
    const html = await fetchHtml(url, options);

    // Extract title
    const title = extractTitleFromHtml(html);

    if (!title) {
      return {
        url,
        title: null,
        error: TitleFetchError.NOT_FOUND,
        errorMessage: "Title not found in the HTML",
      };
    }

    return {
      url,
      title,
    };
  } catch (error) {
    let errorType = TitleFetchError.NETWORK_ERROR;
    let errorMessage = "Failed to fetch URL";

    if (error instanceof Error) {
      errorMessage = error.message;

      if (errorMessage.includes("timeout")) {
        errorType = TitleFetchError.TIMEOUT_ERROR;
      } else if (errorMessage.includes("parsing")) {
        errorType = TitleFetchError.PARSING_ERROR;
      }
    }

    return {
      url,
      title: null,
      error: errorType,
      errorMessage,
    };
  }
}

/**
 * Fetches titles from multiple URLs
 * @param urls Array of URLs to fetch titles from
 * @param options Options for the fetch operations
 * @returns A promise that resolves to an array of TitleFetchResults
 */
export async function fetchTitles(urls: string[], options: TitleFetchOptions = {}): Promise<TitleFetchResult[]> {
  const promises = urls.map((url) => fetchTitle(url, options));
  return Promise.all(promises);
}
