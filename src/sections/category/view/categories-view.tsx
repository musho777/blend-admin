import type { Category } from 'src/services/api';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { apiService } from 'src/services/api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ImageCropper } from 'src/components/image-cropper';

// ----------------------------------------------------------------------

interface CategoryFormData {
  title: string;
  image?: File;
  existingImage?: string;
  slug?: string;
}

export function CategoriesView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    title: '',
    image: undefined,
    existingImage: '',
    slug: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToProcess, setImageToProcess] = useState<{ file: File; src: string } | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getCategories();
      setCategories(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        title: category.title,
        image: undefined,
        existingImage: category.image,
        slug: category.slug || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        title: '',
        image: undefined,
        existingImage: '',
        slug: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      title: '',
      image: undefined,
      existingImage: '',
      slug: '',
    });
    if (imageToProcess) {
      URL.revokeObjectURL(imageToProcess.src);
      setImageToProcess(null);
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const src = URL.createObjectURL(file);
    setImageToProcess({ file, src });
    setCropperOpen(true);
  };

  const handleCropComplete = (croppedFile: File) => {
    setFormData((prev) => ({
      ...prev,
      image: croppedFile,
    }));
    setCropperOpen(false);
    setImageToProcess(null);
  };

  const handleCropperClose = () => {
    setCropperOpen(false);
    if (imageToProcess) {
      URL.revokeObjectURL(imageToProcess.src);
    }
    setImageToProcess(null);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: undefined,
      existingImage: '',
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      if (formData.slug) {
        formDataToSend.append('slug', formData.slug);
      }

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingCategory) {
        await apiService.updateCategoryWithImage(editingCategory.id, formDataToSend);
      } else {
        await apiService.createCategoryWithImage(formDataToSend);
      }

      await fetchCategories();
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await apiService.deleteCategory(id);
        await fetchCategories();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete category');
      }
    }
  };

  return (
    <Box sx={{ p: '0 20px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
        <Typography variant="h4" flexGrow={1}>
          Categories
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenDialog()}
        >
          New Category
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{category.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {category.slug || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {category.image ? (
                          <Box
                            component="img"
                            src={category?.image}
                            alt={category.title}
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            No image
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog(category)}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(category.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              helperText="URL-friendly version of title (optional)"
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Category Image {!editingCategory && '*'}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Iconify icon="mingcute:add-line" />}
                disabled={!!(formData.image || formData.existingImage)}
                sx={{ mb: 2 }}
              >
                Select Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </Button>

              {(formData.existingImage || formData.image) && (
                <Box
                  sx={{
                    position: 'relative',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    overflow: 'hidden',
                    width: 200,
                    height: 200,
                  }}
                >
                  <Box
                    component="img"
                    src={
                      formData.image ? URL.createObjectURL(formData.image) : formData.existingImage
                    }
                    alt="Category preview"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleRemoveImage}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                  >
                    <Iconify icon="mingcute:close-line" width={20} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !formData.title || (!formData.image && !formData.existingImage)}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {imageToProcess && (
        <ImageCropper
          open={cropperOpen}
          onClose={handleCropperClose}
          onCropComplete={handleCropComplete}
          imageSrc={imageToProcess.src}
          fileName={imageToProcess.file.name}
          cropWidth={800}
          cropHeight={450}
        />
      )}
    </Box>
  );
}
