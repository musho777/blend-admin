import { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Stack,
  Table,
  Alert,
  Button,
  Dialog,
  Switch,
  TableRow,
  Container,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
  FormControlLabel,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';

import { apiService } from '../../../services/api';
import { Iconify } from '../../../components/iconify';
import { Scrollbar } from '../../../components/scrollbar';
import { BannerCarousel } from '../../../components/banner-carousel';
import { ImageCropper } from '../../../components/image-cropper/image-cropper';

import type { Banner, BannerFormData } from '../types';

export function BannersView() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    image: null,
    url: '',
    text: '',
    textAm: '',
    textRu: '',
    priority: 1,
    isActive: true,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [openCropper, setOpenCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeLanguageTab, setActiveLanguageTab] = useState<'en' | 'am' | 'ru'>('en');

  // Fetch banners on component mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getBanners();
        setBanners(data);
      } catch (err) {
        console.error('Failed to fetch banners:', err);
        setError('Failed to load banners. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleOpenDialog = useCallback(() => {
    setOpenDialog(true);
    setEditingBanner(null);
    setFormData({
      image: null,
      url: '',
      text: '',
      textAm: '',
      textRu: '',
      priority: 1,
      isActive: true,
    });
    setImagePreview('');
    setFormError(null);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingBanner(null);
    setFormData({
      image: null,
      url: '',
      text: '',
      textAm: '',
      textRu: '',
      priority: 1,
      isActive: true,
    });
    setImagePreview('');
    setFormError(null);
  }, []);

  const handleEdit = useCallback((banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      image: null,
      url: banner.url,
      text: banner.text || '',
      textAm: banner.textAm || '',
      textRu: banner.textRu || '',
      priority: banner.priority || 1,
      isActive: banner.isActive ?? true,
    });
    setImagePreview(banner.image);
    setFormError(null);
    setOpenDialog(true);
  }, []);

  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setOpenCropper(true);
    }
  }, []);

  const handleCropComplete = useCallback((croppedFile: File) => {
    setFormData((prev) => ({ ...prev, image: croppedFile }));
    setImagePreview(URL.createObjectURL(croppedFile));
    setOpenCropper(false);
    setSelectedFile(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      setFormError(null);
      const formDataToSend = new FormData();

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      formDataToSend.append('url', formData.url);
      formDataToSend.append('text', formData.text);
      if (formData.textAm) {
        formDataToSend.append('textAm', formData.textAm);
      }
      if (formData.textRu) {
        formDataToSend.append('textRu', formData.textRu);
      }
      formDataToSend.append('priority', formData.priority.toString());
      formDataToSend.append('isActive', formData.isActive.toString());

      if (editingBanner) {
        // Update existing banner
        const updated = await apiService.updateBannerWithImage(editingBanner.id, formDataToSend);
        setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      } else {
        // Create new banner
        const created = await apiService.createBannerWithImage(formDataToSend);
        setBanners((prev) => [created, ...prev]);
      }

      handleCloseDialog();
    } catch (err: any) {
      console.error('Failed to save banner:', err);

      // Extract error message from the response
      let errorMessage = 'Failed to save banner. Please try again.';

      if (err?.message) {
        errorMessage = err.message;
      }

      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [editingBanner, formData, handleCloseDialog]);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await apiService.deleteBanner(id);
        setBanners((prev) => prev.filter((banner) => banner.id !== id));
      } catch (err) {
        console.error('Failed to delete banner:', err);
        alert('Failed to delete banner. Please try again.');
      }
    }
  }, []);

  const handleToggleActive = useCallback(
    async (id: string) => {
      const banner = banners.find((b) => b.id === id);
      if (!banner) return;

      try {
        const formDataToSend = new FormData();
        formDataToSend.append('isActive', (!banner.isActive).toString());

        const updated = await apiService.updateBannerWithImage(id, formDataToSend);
        setBanners((prev) => prev.map((b) => (b.id === id ? updated : b)));
      } catch (err) {
        console.error('Failed to update banner status:', err);
        alert('Failed to update status. Please try again.');
      }
    },
    [banners]
  );

  const isFormValid = !!imagePreview;

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Banners</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon={'eva:plus-fill' as any} />}
            onClick={handleOpenDialog}
            disabled={loading}
          >
            New Banner
          </Button>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Banner Carousel Preview */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Banner Preview
              </Typography>
              <BannerCarousel banners={banners} />
            </Card>

            {/* Banners Table */}
            <Card>
              <Scrollbar>
                <TableContainer sx={{ minWidth: 800 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>URL</TableCell>
                        <TableCell>Text</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {banners.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                              No banners found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        banners.map((banner) => (
                          <TableRow key={banner.id} hover>
                            <TableCell>
                              <Box
                                component="img"
                                src={banner.image}
                                alt={banner.text || 'Banner'}
                                sx={{
                                  width: 120,
                                  height: 40,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                {banner.url}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                                {banner.text || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{banner.priority || 1}</Typography>
                            </TableCell>
                            <TableCell>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={banner.isActive}
                                    onChange={() => handleToggleActive(banner.id)}
                                    size="small"
                                  />
                                }
                                label={banner.isActive ? 'Active' : 'Inactive'}
                              />
                            </TableCell>
                            <TableCell>
                              {banner.createdAt
                                ? new Date(banner.createdAt).toLocaleDateString()
                                : '-'}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton onClick={() => handleEdit(banner)} size="small">
                                <Iconify icon={'eva:edit-fill' as any} />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDelete(banner.id)}
                                size="small"
                                color="error"
                              >
                                <Iconify icon={'eva:trash-2-outline' as any} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Scrollbar>
            </Card>
          </>
        )}
      </Stack>

      {/* Add/Edit Banner Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBanner ? 'Edit Banner' : 'New Banner'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Error Alert */}
            {formError && (
              <Alert severity="error" onClose={() => setFormError(null)}>
                {formError}
              </Alert>
            )}
            {/* Image Upload */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Banner Image *
              </Typography>
              {imagePreview ? (
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      setImagePreview('');
                      setFormData((prev) => ({ ...prev, image: null }));
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Iconify icon={'eva:close-fill' as any} />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<Iconify icon={'eva:cloud-upload-fill' as any} />}
                  sx={{ height: 120 }}
                >
                  Upload Image
                  <input type="file" hidden accept="image/*" onChange={handleImageSelect} />
                </Button>
              )}
            </Box>

            {/* URL Field */}
            <TextField
              fullWidth
              label="Banner URL"
              value={formData.url}
              onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com or /products"
            />

            {/* Text Field with Language Tabs */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Banner Text
              </Typography>
              <Tabs
                value={activeLanguageTab}
                onChange={(_, newValue) => setActiveLanguageTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              >
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>🇬🇧</span>
                      <span>English</span>
                    </Box>
                  }
                  value="en"
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>🇦🇲</span>
                      <span>Armenian</span>
                    </Box>
                  }
                  value="am"
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>🇷🇺</span>
                      <span>Russian</span>
                    </Box>
                  }
                  value="ru"
                />
              </Tabs>

              {/* English Field */}
              {activeLanguageTab === 'en' && (
                <TextField
                  fullWidth
                  label="Banner Text (English)"
                  value={formData.text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
                  placeholder="Optional promotional text in English"
                  multiline
                  rows={2}
                />
              )}

              {/* Armenian Field */}
              {activeLanguageTab === 'am' && (
                <TextField
                  fullWidth
                  label="Տեքստ (Armenian)"
                  value={formData.textAm}
                  onChange={(e) => setFormData((prev) => ({ ...prev, textAm: e.target.value }))}
                  placeholder="Գովազդային տեքստ հայերեն"
                  helperText="Optional - Leave empty if not needed"
                  multiline
                  rows={2}
                />
              )}

              {/* Russian Field */}
              {activeLanguageTab === 'ru' && (
                <TextField
                  fullWidth
                  label="Текст (Russian)"
                  value={formData.textRu}
                  onChange={(e) => setFormData((prev) => ({ ...prev, textRu: e.target.value }))}
                  placeholder="Рекламный текст на русском языке"
                  helperText="Optional - Leave empty if not needed"
                  multiline
                  rows={2}
                />
              )}
            </Box>

            {/* Priority Field */}
            <TextField
              fullWidth
              label="Priority"
              type="number"
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value, 10) || 1 }))
              }
              placeholder="1"
              required
              helperText="Lower numbers appear first in the carousel"
              inputProps={{ min: 1 }}
            />

            {/* Active Status */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Active"
            />

            {!isFormValid && <Alert severity="warning">Please upload an image</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!isFormValid || submitting}>
            {submitting ? 'Saving...' : editingBanner ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Cropper Dialog */}
      {selectedFile && (
        <ImageCropper
          open={openCropper}
          imageSrc={URL.createObjectURL(selectedFile)}
          fileName={selectedFile.name}
          onClose={() => {
            setOpenCropper(false);
            setSelectedFile(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </Container>
  );
}
