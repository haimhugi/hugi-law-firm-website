export {};

declare global {
  interface Window {
    __reportCspViolation: (message: string) => void;
    __inlineRan?: boolean;
  }
}
