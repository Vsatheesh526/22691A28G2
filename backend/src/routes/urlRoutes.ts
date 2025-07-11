import { Router, Request, Response } from 'express';
import { UrlShortenerService } from '../services/urlShortener';
import { logger } from '../middleware/logger';
import { ShortUrlRequest } from '../types';

const router = Router();
const urlService = new UrlShortenerService();

// POST /shorturls - Create a new short URL
router.post('/shorturls', (req: Request, res: Response) => {
  try {
    const { url, validity, shortcode }: ShortUrlRequest = req.body;

    logger.log('backend', 'info', 'route', 'POST /shorturls received', {
      url,
      validity,
      shortcode: shortcode || 'auto-generated'
    });

    const result = urlService.createShortUrl({ url, validity, shortcode });

    logger.log('backend', 'info', 'route', 'POST /shorturls successful', {
      shortlink: result.shortlink,
      expiry: result.expiry
    });

    res.status(201).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.log('backend', 'error', 'route', 'POST /shorturls failed', {
      error: errorMessage,
      body: req.body
    });

    if (errorMessage.includes('Shortcode already exists')) {
      return res.status(409).json({ error: 'Shortcode already exists' });
    }

    if (errorMessage.includes('Validation failed')) {
      return res.status(400).json({ error: errorMessage });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /shorturls/:code - Get URL data and analytics
router.get('/shorturls/:code', (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    logger.log('backend', 'info', 'route', `GET /shorturls/${code} received`);

    const urlData = urlService.getUrlData(code);

    if (!urlData) {
      logger.log('backend', 'warn', 'route', `GET /shorturls/${code} - URL not found`);
      return res.status(404).json({ error: 'URL not found' });
    }

    // Return the data in the required format
    const response = {
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt,
      expiresAt: urlData.expiresAt,
      clicks: urlData.clicks
    };

    logger.log('backend', 'info', 'route', `GET /shorturls/${code} successful`, {
      clicksCount: urlData.clicks.length
    });

    res.status(200).json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.log('backend', 'error', 'route', `GET /shorturls/${code} failed`, {
      error: errorMessage,
      code: req.params.code
    });

    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /stats - Get all URLs (for admin purposes)
router.get('/stats', (req: Request, res: Response) => {
  try {
    logger.log('backend', 'info', 'route', 'GET /stats requested');

    const urls = urlService.getAllUrls();
    const stats = urlService.getStorageStats();

    logger.log('backend', 'info', 'route', 'GET /stats successful', {
      totalUrls: stats.total,
      activeUrls: stats.active
    });

    res.status(200).json({
      urls,
      stats
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.log('backend', 'error', 'route', 'GET /stats failed', {
      error: errorMessage
    });

    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:code - Redirect to original URL
router.get('/:code', (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const userAgent = req.get('User-Agent');

    logger.log('backend', 'info', 'route', `GET /${code} redirect requested`, {
      userAgent: userAgent?.substring(0, 100)
    });

    const originalUrl = urlService.trackClick(code, userAgent);

    if (!originalUrl) {
      logger.log('backend', 'warn', 'route', `GET /${code} - URL not found for redirect`);
      return res.status(404).json({ error: 'URL not found' });
    }

    logger.log('backend', 'info', 'route', `GET /${code} redirect successful`, {
      originalUrl,
      code
    });

    res.status(302).redirect(originalUrl);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.log('backend', 'error', 'route', `GET /${code} redirect failed`, {
      error: errorMessage,
      code: req.params.code
    });

    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 