import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { logger } from '../utils/logger';
import { apiService, ShortUrlRequest, ShortUrlResponse } from '../services/api';

interface FormData {
  url: string;
  validity: string;
  shortcode: string;
}

interface FormErrors {
  url?: string;
  validity?: string;
  shortcode?: string;
}

const ShortenerPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    url: '',
    validity: '30',
    shortcode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortUrlResponse | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // URL validation
    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        const url = new URL(formData.url);
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.url = 'URL must start with http:// or https://';
        }
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    // Validity validation
    const validity = parseInt(formData.validity);
    if (isNaN(validity) || validity < 1 || validity > 1440) {
      newErrors.validity = 'Validity must be between 1 and 1440 minutes (24 hours)';
    }

    // Shortcode validation
    if (formData.shortcode.trim()) {
      if (formData.shortcode.length < 3 || formData.shortcode.length > 20) {
        newErrors.shortcode = 'Shortcode must be between 3 and 20 characters';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.shortcode)) {
        newErrors.shortcode = 'Shortcode can only contain letters, numbers, hyphens, and underscores';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logger.log('frontend', 'info', 'form', 'URL shortening form submitted', { formData });

    if (!validateForm()) {
      logger.log('frontend', 'warn', 'form', 'Form validation failed', { errors });
      return;
    }

    setLoading(true);
    setApiError('');
    setResult(null);

    try {
      const request: ShortUrlRequest = {
        url: formData.url.trim(),
        validity: parseInt(formData.validity),
        shortcode: formData.shortcode.trim() || undefined,
      };

      const response = await apiService.createShortUrl(request);
      setResult(response);
      
      logger.log('frontend', 'info', 'form', 'URL shortened successfully', {
        shortlink: response.shortlink,
        expiry: response.expiry
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create short URL';
      setApiError(errorMessage);
      
      logger.log('frontend', 'error', 'form', 'URL shortening failed', {
        error: errorMessage,
        formData
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopySuccess(true);
      logger.log('frontend', 'info', 'copy', 'URL copied to clipboard', { text });
    } catch (error) {
      logger.log('frontend', 'error', 'copy', 'Failed to copy URL', { error });
    }
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        URL Shortener
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Create short, shareable links in seconds
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Original URL"
                  value={formData.url}
                  onChange={handleInputChange('url')}
                  error={!!errors.url}
                  helperText={errors.url || 'Enter the URL you want to shorten'}
                  placeholder="https://example.com"
                  sx={{ mb: 3 }}
                />

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Validity (minutes)"
                      type="number"
                      value={formData.validity}
                      onChange={handleInputChange('validity')}
                      error={!!errors.validity}
                      helperText={errors.validity || 'Default: 30 minutes'}
                      inputProps={{ min: 1, max: 1440 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Custom Shortcode (optional)"
                      value={formData.shortcode}
                      onChange={handleInputChange('shortcode')}
                      error={!!errors.shortcode}
                      helperText={errors.shortcode || 'Leave empty for auto-generation'}
                      placeholder="my-link"
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
                >
                  {loading ? 'Creating...' : 'Create Short URL'}
                </Button>
              </form>

              {apiError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {apiError}
                </Alert>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card sx={{ mt: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Your Short URL
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    value={result.shortlink}
                    InputProps={{ readOnly: true }}
                    sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
                  />
                  <IconButton
                    onClick={() => handleCopy(result.shortlink)}
                    color="primary"
                    size="large"
                  >
                    <CopyIcon />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={`Expires: ${new Date(result.expiry).toLocaleString()}`}
                    color="info"
                    size="small"
                  />
                  <Chip
                    label="Click to copy"
                    color="success"
                    size="small"
                    icon={<CheckIcon />}
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Snackbar
        open={showCopySuccess}
        autoHideDuration={3000}
        onClose={() => setShowCopySuccess(false)}
        message="URL copied to clipboard!"
      />
    </Box>
  );
};

export default ShortenerPage; 