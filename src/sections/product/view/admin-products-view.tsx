import type { Product, Category } from 'src/services/api';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { apiService } from 'src/services/api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

interface ProductFormData {
  title: string;
  price: number;
  stock: number;
  categoryId: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isBestSelect?: boolean;
  priority?: number;
  image?: File[];
  existingImages?: string[];
  imagesToRemove?: string[];
}

export function AdminProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    price: 0,
    stock: 0,
    categoryId: '',
    isFeatured: false,
    isBestSeller: false,
    isBestSelect: false,
    priority: 0,
    image: [],
    existingImages: [],
    imagesToRemove: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        isFeatured: product.isFeatured || false,
        isBestSeller: product.isBestSeller || false,
        isBestSelect: product.isBestSelect || false,
        priority: product.priority || 0,
        image: [],
        existingImages: product.imageUrls || [],
        imagesToRemove: [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        price: 0,
        stock: 0,
        categoryId: '',
        isFeatured: false,
        isBestSeller: false,
        isBestSelect: false,
        priority: 0,
        image: [],
        existingImages: [],
        imagesToRemove: [],
      });
    }
    setOpenDialog(true);
  };

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, product: Product) => {
      setOpenPopover(event.currentTarget);
      setSelectedProduct(product);
    },
    []
  );

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
    setSelectedProduct(null);
  }, []);

  const handleEditFromMenu = useCallback(() => {
    if (selectedProduct) {
      handleOpenDialog(selectedProduct);
      handleClosePopover();
    }
  }, [selectedProduct]);

  const handleDeleteFromMenu = useCallback(() => {
    if (selectedProduct) {
      handleDelete(selectedProduct.id);
      handleClosePopover();
    }
  }, [selectedProduct]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setFormData({
      title: '',
      price: 0,
      stock: 0,
      categoryId: '',
      isFeatured: false,
      isBestSeller: false,
      isBestSelect: false,
      priority: 0,
      image: [],
      existingImages: [],
      imagesToRemove: [],
    });
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const selectedFiles = Array.from(files);
    const currentImages = formData.image || [];
    const existingImages = formData.existingImages || [];
    const totalImages = currentImages.length + existingImages.length + selectedFiles.length;

    if (totalImages > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      image: [...currentImages, ...selectedFiles],
    }));
    setError('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      image: prev.image?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleRemoveExistingImage = (index: number) => {
    setFormData((prev) => {
      const imageToRemove = prev.existingImages?.[index];
      return {
        ...prev,
        existingImages: prev.existingImages?.filter((_, i) => i !== index) || [],
        imagesToRemove: imageToRemove
          ? [...(prev.imagesToRemove || []), imageToRemove]
          : prev.imagesToRemove || [],
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('price', Math.max(0, formData.price).toString());
      formDataToSend.append('stock', Math.max(0, formData.stock).toString());
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('isFeatured', formData.isFeatured ? 'true' : 'false');
      formDataToSend.append('isBestSeller', formData.isBestSeller ? 'true' : 'false');
      formDataToSend.append('isBestSelect', formData.isBestSelect ? 'true' : 'false');
      formDataToSend.append('priority', Math.max(0, formData.priority || 0).toString());

      formData.image?.forEach((file) => {
        formDataToSend.append('images', file);
      });

      if (formData.imagesToRemove?.length) {
        formData.imagesToRemove.forEach((imageUrl, index) => {
          formDataToSend.append(`imagesToRemove[${index}]`, imageUrl);
        });
      }

      if (editingProduct) {
        await apiService.updateProductWithImages(editingProduct.id, formDataToSend);
      } else {
        await apiService.createProductWithImages(formDataToSend);
      }

      await fetchData();
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteProduct(id);
        await fetchData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete product');
      }
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.title : 'Unknown';
  };

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
        <Typography variant="h4" flexGrow={1}>
          Products Management
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenDialog()}
        >
          New Product
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
            <Table sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Featured</TableCell>
                  <TableCell>Best Seller</TableCell>
                  <TableCell>Best Select</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{product.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getCategoryName(product.categoryId)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">${product.price.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{product.stock}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{product.isFeatured ? '✓' : '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{product.isBestSeller ? '✓' : '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{product.isBestSelect ? '✓' : '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{product.priority || 0}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(event) => handleOpenPopover(event, product)}>
                          <Iconify icon="eva:more-vertical-fill" />
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
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setFormData((prev) => ({ ...prev, price: Math.max(0, value) }));
                }}
                required
                inputProps={{ min: 0, step: 0.01 }}
                error={formData.price < 0 || isNaN(formData.price)}
                helperText={formData.price < 0 ? 'Price must be 0 or greater' : ''}
              />
              <TextField
                fullWidth
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10) || 0;
                  setFormData((prev) => ({ ...prev, stock: Math.max(0, value) }));
                }}
                required
                inputProps={{ min: 0 }}
                error={formData.stock < 0 || isNaN(formData.stock)}
                helperText={formData.stock < 0 ? 'Stock must be 0 or greater' : ''}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                label="Category"
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Product Flags
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))
                    }
                  />
                }
                label="Featured Product"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isBestSeller}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isBestSeller: e.target.checked }))
                    }
                  />
                }
                label="Best Seller"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isBestSelect}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isBestSelect: e.target.checked }))
                    }
                  />
                }
                label="Best Select"
              />
            </Box>

            <TextField
              fullWidth
              label="Priority"
              type="number"
              value={formData.priority}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10) || 0;
                setFormData((prev) => ({ ...prev, priority: Math.max(0, value) }));
              }}
              helperText="Higher priority products appear first (0 = no priority)"
              inputProps={{ min: 0 }}
              error={(formData.priority || 0) < 0 || isNaN(formData.priority || 0)}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Product Images (Max 5)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Iconify icon="mingcute:add-line" />}
                disabled={
                  (formData.image?.length || 0) + (formData.existingImages?.length || 0) >= 5
                }
                sx={{ mb: 2 }}
              >
                Upload Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </Button>

              {((formData?.existingImages && formData?.existingImages?.length > 0) ||
                (formData.image && formData.image?.length > 0)) && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {/* Existing Images */}
                  {formData.existingImages?.map((imageUrl, index) => (
                    <Box
                      key={`existing-${index}`}
                      sx={{
                        position: 'relative',
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        overflow: 'hidden',
                        width: 120,
                        height: 120,
                      }}
                    >
                      <Box
                        component="img"
                        src={`http://localhost:3000${imageUrl}`}
                        alt={`Existing ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveExistingImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                          },
                        }}
                      >
                        <Iconify icon="mingcute:close-line" width={16} />
                      </IconButton>
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          bottom: 4,
                          left: 4,
                          bgcolor: 'rgba(0, 0, 0, 0.6)',
                          color: 'white',
                          px: 1,
                          borderRadius: 0.5,
                          fontSize: '0.65rem',
                          maxWidth: '100px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Uploaded
                      </Typography>
                    </Box>
                  ))}

                  {/* New Images */}
                  {formData.image?.map((file, index) => (
                    <Box
                      key={`new-${index}`}
                      sx={{
                        position: 'relative',
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        overflow: 'hidden',
                        width: 120,
                        height: 120,
                      }}
                    >
                      <Box
                        component="img"
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                          },
                        }}
                      >
                        <Iconify icon="mingcute:close-line" width={16} />
                      </IconButton>
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          bottom: 4,
                          left: 4,
                          bgcolor: 'rgba(0, 0, 0, 0.6)',
                          color: 'white',
                          px: 1,
                          borderRadius: 0.5,
                          fontSize: '0.65rem',
                          maxWidth: '100px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {file.name}
                      </Typography>
                    </Box>
                  ))}
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
            disabled={
              submitting ||
              !formData.title.trim() ||
              !formData.categoryId ||
              formData.price < 0 ||
              formData.stock < 0 ||
              isNaN(formData.price) ||
              isNaN(formData.stock) ||
              isNaN(formData.priority || 0)
            }
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleEditFromMenu}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleDeleteFromMenu} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </div>
  );
}
