import type { AxiosResponse } from "axios";

/**
 * Interface for the data returned directly from Cloudflare Turnstile's siteverify endpoint.
 */
interface CloudflareTurnstileVerifyResponse {
  /**
   * Whether the challenge was successfully passed.
   */
  success: boolean;
  /**
   * Timestamp of the challenge (e.g., "2025-06-17T10:00:00Z").
   */
  challenge_ts: string;
  /**
   * The hostname of the site where the challenge was solved.
   */
  hostname: string;
  /**
   * Array of error codes if `success` is `false`.
   * Common codes: 'missing-input-secret', 'invalid-input-secret', 'missing-input-response',
   * 'invalid-input-response', 'bad-request', 'timeout-or-duplicate', 'internal-error'.
   * Refer to Cloudflare Turnstile documentation for a full list.
   */
  "error-codes"?: string[];
  /**
   * The action string you set during rendering the widget, if any.
   */
  action?: string;
  /**
   * The cdata string you set during rendering the widget, if any.
   */
  cdata?: string;
}

/**
 * Type for the full Axios response object when verifying Turnstile.
 * The 'data' property will conform to the CloudflareTurnstileVerifyResponse interface.
 */
export type TurnstileAxiosResponse =
  AxiosResponse<CloudflareTurnstileVerifyResponse>;
