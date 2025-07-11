import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { logger } from '../utils/logger';
import { apiService, StatsResponse } from '../services/api';

const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    logger.log('frontend', 'info', 'page', 'Loading statistics page');
    
    setLoading(true);
    setError('');

    try {
      const data = await apiService.getStats();
      setStats(data);
      
      logger.log('frontend', 'info', 'page', 'Statistics loaded successfully', {
        totalUrls: data.stats.total,
        activeUrls: data.stats.active
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load statistics';
      setError(errorMessage);
      
      logger.log('frontend', 'error', 'page', 'Failed to load statistics', {
        error: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.log('frontend', 'info', 'copy', 'URL copied to clipboard', { text });
    } catch (error) {
      logger.log('frontend', 'error', 'copy', 'Failed to copy URL', { error });
    }
  };

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank');
    logger.log('frontend', 'info', 'navigation', 'Opening URL in new tab', { url });
  };

  const getStatusColor = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    return expiry > now ? 'success' : 'error';
  };

  const getStatusText = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    return expiry > now ? 'Active' : 'Expired';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        URL Statistics
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Track your shortened URLs and their performance
      </Typography>

      {stats && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" component="div">
                    {stats.stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total URLs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TimelineIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" component="div">
                    {stats.stats.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active URLs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <OpenIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" component="div">
                    {stats.urls.reduce((total, url) => total + url.clicks.length, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Clicks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* URLs Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                URL Details
              </Typography>
              
              {stats.urls.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No URLs found. Create your first short URL!
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Short URL</TableCell>
                        <TableCell>Original URL</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Expires</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Clicks</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.urls.map((url) => (
                        <TableRow key={url.shortcode}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {`http://localhost:8000/${url.shortcode}`}
                              </Typography>
                              <Tooltip title="Copy URL">
                                <IconButton
                                  size="small"
                                  onClick={() => handleCopy(`http://localhost:8000/${url.shortcode}`)}
                                >
                                  <CopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {url.originalUrl}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {format(new Date(url.createdAt), 'MMM dd, yyyy HH:mm')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {format(new Date(url.expiresAt), 'MMM dd, yyyy HH:mm')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusText(url.expiresAt)}
                              color={getStatusColor(url.expiresAt) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {url.clicks.length}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Open URL">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenUrl(`http://localhost:8000/${url.shortcode}`)}
                              >
                                <OpenIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* Click Analytics */}
          {stats.urls.some(url => url.clicks.length > 0) && (
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Click Analytics
                </Typography>
                
                {stats.urls.map((url) => (
                  url.clicks.length > 0 && (
                    <Box key={url.shortcode} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {`http://localhost:8000/${url.shortcode}`}
                      </Typography>
                      <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Timestamp</TableCell>
                              <TableCell>Source</TableCell>
                              <TableCell>Location</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {url.clicks.map((click, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Typography variant="body2">
                                    {format(new Date(click.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={click.source} size="small" />
                                </TableCell>
                                <TableCell>
                                  <Chip label={click.location} size="small" variant="outlined" />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default StatsPage; 