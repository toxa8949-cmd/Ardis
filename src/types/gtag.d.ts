// Глобальна декларація gtag (Google Analytics / Google Ads)
export {};

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetOrEventName: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}
