import axios from 'axios';
import { logger } from '../utils/logger';

const API_BASE_URL = 'http://localhost:8000';

export interface ShortUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface ShortUrlResponse {
  shortlink: string;
  expiry: string;
}

export interface ClickAnalytics {
  timestamp: string;
  source: string;
  location: string;
}

export interface UrlData {
  originalUrl: string;
  createdAt: string;
  expiresAt: string;
  clicks: ClickAnalytics[];
}

export interface StatsResponse {
  urls: Array<UrlData & { shortcode: string }>;
  stats: {
    total: number;
    active: number;
  };
}

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async createShortUrl(data: ShortUrlRequest): Promise<ShortUrlResponse> {
    try {
      logger.log('frontend', 'info', 'api', 'Creating short URL', { url: data.url });
      
      const response = await this.api.post<ShortUrlResponse>('/shorturls', data);
      
      logger.log('frontend', 'info', 'api', 'Short URL created successfully', {
        shortlink: response.data.shortlink,
        expiry: response.data.expiry
      });
      
      return response.data;
    } catch (error) {
      logger.log('frontend', 'error', 'api', 'Failed to create short URL', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data
      });
      throw error;
    }
  }

  async getUrlData(shortcode: string): Promise<UrlData> {
    try {
      logger.log('frontend', 'info', 'api', 'Fetching URL data', { shortcode });
      
      const response = await this.api.get<UrlData>(`/shorturls/${shortcode}`);
      
      logger.log('frontend', 'info', 'api', 'URL data fetched successfully', {
        shortcode,
        clicksCount: response.data.clicks.length
      });
      
      return response.data;
    } catch (error) {
      logger.log('frontend', 'error', 'api', 'Failed to fetch URL data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        shortcode
      });
      throw error;
    }
  }

  async getStats(): Promise<StatsResponse> {
    try {
      logger.log('frontend', 'info', 'api', 'Fetching stats');
      
      const response = await this.api.get<StatsResponse>('/stats');
      
      logger.log('frontend', 'info', 'api', 'Stats fetched successfully', {
        totalUrls: response.data.stats.total,
        activeUrls: response.data.stats.active
      });
      
      return response.data;
    } catch (error) {
      logger.log('frontend', 'error', 'api', 'Failed to fetch stats', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      logger.log('frontend', 'debug', 'api', 'Testing API connection');
      
      const response = await this.api.get('/health');
      
      logger.log('frontend', 'info', 'api', 'API connection successful', {
        status: response.data.status
      });
      
      return response.data.status === 'OK';
    } catch (error) {
      logger.log('frontend', 'error', 'api', 'API connection failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
}

export const apiService = new ApiService(); 