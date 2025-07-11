export interface ShortUrlRequest {
  url: string;
  validity?: number; // in minutes
  shortcode?: string;
}

export interface ShortUrlResponse {
  shortlink: string;
  expiry: string; // ISO8601
}

export interface ClickAnalytics {
  timestamp: string; // ISO8601
  source: string; // "direct", "web", "app"
  location: string; // country code
}

export interface ShortUrlData {
  originalUrl: string;
  createdAt: string; // ISO8601
  expiresAt: string; // ISO8601
  clicks: ClickAnalytics[];
  shortcode: string;
}

export interface InMemoryStorage {
  [shortcode: string]: ShortUrlData;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  error: string;
  details?: ValidationError[];
}

// Mock data for analytics
export const MOCK_LOCATIONS = ['US', 'CA', 'UK', 'DE', 'FR', 'JP', 'AU', 'BR', 'IN', 'MX'];
export const MOCK_SOURCES = ['direct', 'web', 'app'];

export const generateMockAnalytics = (): ClickAnalytics => ({
  timestamp: new Date().toISOString(),
  source: MOCK_SOURCES[Math.floor(Math.random() * MOCK_SOURCES.length)],
  location: MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)]
}); 