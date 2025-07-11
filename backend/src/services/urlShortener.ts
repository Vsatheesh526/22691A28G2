import { nanoid } from 'nanoid';
import { logger } from '../middleware/logger';
import { 
  ShortUrlRequest, 
  ShortUrlResponse, 
  ShortUrlData, 
  InMemoryStorage,
  generateMockAnalytics,
  ValidationError 
} from '../types';

export class UrlShortenerService {
  private storage: InMemoryStorage = {};
  private readonly DEFAULT_VALIDITY_MINUTES = 30;
  private readonly SHORTCODE_LENGTH = 8;

  private validateUrl(url: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (!url) {
      errors.push({ field: 'url', message: 'URL is required' });
      return errors;
    }

    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push({ field: 'url', message: 'URL must start with http:// or https://' });
      }
    } catch {
      errors.push({ field: 'url', message: 'Invalid URL format' });
    }

    return errors;
  }

  private validateShortcode(shortcode: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (shortcode) {
      if (shortcode.length < 3 || shortcode.length > 20) {
        errors.push({ field: 'shortcode', message: 'Shortcode must be between 3 and 20 characters' });
      }
      
      if (!/^[a-zA-Z0-9_-]+$/.test(shortcode)) {
        errors.push({ field: 'shortcode', message: 'Shortcode can only contain letters, numbers, hyphens, and underscores' });
      }
      
      if (this.storage[shortcode]) {
        errors.push({ field: 'shortcode', message: 'Shortcode already exists' });
      }
    }

    return errors;
  }

  private generateShortcode(): string {
    return nanoid(this.SHORTCODE_LENGTH);
  }

  private cleanupExpiredUrls(): void {
    const now = new Date();
    const expiredCodes = Object.keys(this.storage).filter(code => {
      const urlData = this.storage[code];
      return new Date(urlData.expiresAt) < now;
    });

    expiredCodes.forEach(code => {
      delete this.storage[code];
      logger.log('backend', 'info', 'cleanup', `Expired URL removed: ${code}`);
    });
  }

  createShortUrl(request: ShortUrlRequest): ShortUrlResponse {
    logger.log('backend', 'info', 'service', 'Creating short URL', { url: request.url });

    // Cleanup expired URLs first
    this.cleanupExpiredUrls();

    // Validate input
    const urlErrors = this.validateUrl(request.url);
    const shortcodeErrors = this.validateShortcode(request.shortcode || '');
    const allErrors = [...urlErrors, ...shortcodeErrors];

    if (allErrors.length > 0) {
      logger.log('backend', 'warn', 'validation', 'URL creation failed due to validation errors', { errors: allErrors });
      throw new Error(`Validation failed: ${allErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
    }

    // Generate shortcode
    const shortcode = request.shortcode || this.generateShortcode();
    
    // Check if shortcode already exists
    if (this.storage[shortcode]) {
      logger.log('backend', 'warn', 'conflict', 'Shortcode already exists', { shortcode });
      throw new Error('Shortcode already exists');
    }

    // Calculate expiry
    const validityMinutes = request.validity || this.DEFAULT_VALIDITY_MINUTES;
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + validityMinutes * 60 * 1000);

    // Store URL data
    const urlData: ShortUrlData = {
      originalUrl: request.url,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      clicks: [],
      shortcode
    };

    this.storage[shortcode] = urlData;

    logger.log('backend', 'info', 'service', 'Short URL created successfully', { 
      shortcode, 
      originalUrl: request.url,
      expiresAt: expiresAt.toISOString()
    });

    return {
      shortlink: `http://localhost:8000/${shortcode}`,
      expiry: expiresAt.toISOString()
    };
  }

  getUrlData(shortcode: string): ShortUrlData | null {
    this.cleanupExpiredUrls();
    
    const urlData = this.storage[shortcode];
    if (!urlData) {
      logger.log('backend', 'warn', 'service', 'URL not found', { shortcode });
      return null;
    }

    logger.log('backend', 'info', 'service', 'URL data retrieved', { shortcode });
    return urlData;
  }

  trackClick(shortcode: string, userAgent?: string): string | null {
    this.cleanupExpiredUrls();
    
    const urlData = this.storage[shortcode];
    if (!urlData) {
      logger.log('backend', 'warn', 'service', 'Click tracking failed - URL not found', { shortcode });
      return null;
    }

    // Add click analytics
    const clickData = generateMockAnalytics();
    urlData.clicks.push(clickData);

    logger.log('backend', 'info', 'service', 'Click tracked successfully', { 
      shortcode, 
      originalUrl: urlData.originalUrl,
      clickData 
    });

    return urlData.originalUrl;
  }

  getAllUrls(): ShortUrlData[] {
    this.cleanupExpiredUrls();
    
    const urls = Object.values(this.storage);
    logger.log('backend', 'info', 'service', 'Retrieved all URLs', { count: urls.length });
    
    return urls;
  }

  getStorageStats(): { total: number; active: number } {
    this.cleanupExpiredUrls();
    
    const total = Object.keys(this.storage).length;
    const active = Object.values(this.storage).filter(url => 
      new Date(url.expiresAt) > new Date()
    ).length;

    return { total, active };
  }
} 