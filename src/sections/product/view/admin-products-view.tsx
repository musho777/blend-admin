import type { Product, Category, Subcategory } from 'src/services/api';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Pagination from '@mui/material/Pagination';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { apiService } from 'src/services/api';

import { Iconify } from 'src/components/iconify';
import { ImageCropper } from 'src/components/image-cropper';
import { RichTextEditor } from 'src/components/rich-text-editor';
import { DataTable, type TableColumn } from 'src/components/table';

import { ProductItem } from '../product-item';

interface ProductFormData {
  title: string;
  description: string;
  titleAm: string;
  descriptionAm: string;
  titleRu: string;
  descriptionRu: string;
  price: number;
  stock: number;
  categoryId: string;
  subcategoryId: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isBestSelect?: boolean;
  disabled?: boolean;
  priority?: number;
  image?: File[];
  existingImages?: string[];
  imagesToRemove?: string[];
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function AdminProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    titleAm: '',
    descriptionAm: '',
    titleRu: '',
    descriptionRu: '',
    price: 0,
    stock: 0,
    categoryId: '',
    subcategoryId: '',
    isFeatured: false,
    isBestSeller: false,
    isBestSelect: false,
    disabled: false,
    priority: 0,
    image: [],
    existingImages: [],
    imagesToRemove: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToProcess, setImageToProcess] = useState<{ file: File; src: string } | null>(null);
  const [activeLanguageTab, setActiveLanguageTab] = useState<'en' | 'am' | 'ru'>('en');

  const fetchProducts = useCallback(
    async (page?: number, limit?: number) => {
      try {
        setLoading(true);
        const pageToUse = page ?? currentPage;
        const limitToUse = limit ?? itemsPerPage;
        const productsResponse = await apiService.getProducts({
          page: pageToUse,
          limit: limitToUse,
        });
        setProducts(productsResponse.data || []);
        setPaginationMeta(productsResponse.meta);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        setProducts([]);
        setPaginationMeta(null);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage]
  );

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    }
  }, []);

  const fetchSubcategories = useCallback(async () => {
    try {
      const subcategoriesData = await apiService.getSubcategories();
      setSubcategories(subcategoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subcategories');
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
  }, [fetchProducts, fetchCategories, fetchSubcategories]);

  // Filter subcategories when category changes
  useEffect(() => {
    if (formData.categoryId) {
      const filtered = subcategories.filter((sub) => sub.categoryId === formData.categoryId);
      setFilteredSubcategories(filtered);

      if (formData.subcategoryId) {
        const isValid = filtered.some((sub) => sub.id === formData.subcategoryId);
        if (!isValid) {
          setFormData((prev) => ({ ...prev, subcategoryId: '' }));
        }
      }
    } else {
      setFilteredSubcategories([]);
      setFormData((prev) => ({ ...prev, subcategoryId: '' }));
    }
  }, [formData.categoryId, subcategories, formData.subcategoryId]);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        description: product.description || '',
        titleAm: (product as any).titleAm || '',
        descriptionAm: (product as any).descriptionAm || '',
        titleRu: (product as any).titleRu || '',
        descriptionRu: (product as any).descriptionRu || '',
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || '',
        isFeatured: product.isFeatured || false,
        isBestSeller: product.isBestSeller || false,
        isBestSelect: product.isBestSelect || false,
        disabled: product.disabled || false,
        priority: product.priority || 0,
        image: [],
        existingImages: product.imageUrls || [],
        imagesToRemove: [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        description: '',
        titleAm: '',
        descriptionAm: '',
        titleRu: '',
        descriptionRu: '',
        price: 0,
        stock: 0,
        categoryId: '',
        subcategoryId: '',
        isFeatured: false,
        isBestSeller: false,
        isBestSelect: false,
        disabled: false,
        priority: 0,
        image: [],
        existingImages: [],
        imagesToRemove: [],
      });
    }
    setActiveLanguageTab('en');
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
    setActiveLanguageTab('en');
    setFormData({
      title: '',
      description: '',
      titleAm: '',
      descriptionAm: '',
      titleRu: '',
      descriptionRu: '',
      price: 0,
      stock: 0,
      categoryId: '',
      subcategoryId: '',
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

    if (selectedFiles.length + currentImages.length + existingImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    if (selectedFiles.length > 0) {
      const file = selectedFiles[0];
      const src = URL.createObjectURL(file);
      setImageToProcess({ file, src });
      setCropperOpen(true);
    }
    setError('');
  };

  const handleCropComplete = (croppedFile: File) => {
    const currentImages = formData.image || [];
    setFormData((prev) => ({
      ...prev,
      image: [...currentImages, croppedFile],
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
      formDataToSend.append('description', formData.description);

      // Add multi-language fields
      if (formData.titleAm) {
        formDataToSend.append('titleAm', formData.titleAm);
      }
      if (formData.descriptionAm) {
        formDataToSend.append('descriptionAm', formData.descriptionAm);
      }
      if (formData.titleRu) {
        formDataToSend.append('titleRu', formData.titleRu);
      }
      if (formData.descriptionRu) {
        formDataToSend.append('descriptionRu', formData.descriptionRu);
      }

      formDataToSend.append('price', Math.max(0, formData.price).toString());
      formDataToSend.append('stock', Math.max(0, formData.stock).toString());
      formDataToSend.append('categoryId', formData.categoryId);

      // Add subcategoryId if selected
      if (formData.subcategoryId) {
        formDataToSend.append('subcategoryId', formData.subcategoryId);
      }

      formDataToSend.append('isFeatured', formData.isFeatured ? 'true' : 'false');
      formDataToSend.append('isBestSeller', formData.isBestSeller ? 'true' : 'false');
      formDataToSend.append('isBestSelect', formData.isBestSelect ? 'true' : 'false');
      formDataToSend.append('disabled', formData.disabled ? 'true' : 'false');
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

      await fetchProducts();
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
        await fetchProducts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete product');
      }
    }
  };

  const getDisplayCategory = (categoryId: string, subcategoryId?: string | null) => {
    const category = categories.find((c) => c.id === categoryId);
    const categoryName = category ? category.title : 'Unknown';

    if (subcategoryId) {
      const subcategory = subcategories.find((s) => s.id === subcategoryId);
      if (subcategory) {
        return `${categoryName} > ${subcategory.title}`;
      }
    }

    return categoryName;
  };

  const convertToProductItem = (product: Product) => ({
    id: product.id,
    name: product.title,
    price: product.price,
    status: product.isFeatured ? 'featured' : product.isBestSeller ? 'sale' : '',
    coverUrl: product.imageUrls?.[0]
      ? `${product.imageUrls[0]}`
      : '/assets/images/product/product-1.webp',
    colors: ['#00AB55', '#000000', '#FFFFFF'],
    priceSale: product.isBestSeller ? product.price * 1.2 : null,
    images: product.imageUrls?.map((url) => `${url}`) || ['/assets/images/product/product-1.webp'],
    description:
      product.description ||
      `High-quality ${product.title} from our premium collection. Perfect for everyday use with excellent durability and style.`,
    stock: product.stock,
    category: getDisplayCategory(product.categoryId, product.subcategoryId),
  });

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newViewMode: 'table' | 'card' | null
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setItemsPerPage(pageSize);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, itemsPerPage, fetchProducts]);

  const tableColumns: TableColumn[] = [
    {
      key: 'title',
      label: 'Title',
      render: (value) => <Typography variant="subtitle2">{value}</Typography>,
    },
    {
      key: 'categoryId',
      label: 'Category',
      render: (value, row) => (
        <Typography variant="body2">{getDisplayCategory(value, row.subcategoryId)}</Typography>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (value) => <Typography variant="body2">{value.toFixed(2)} AMD</Typography>,
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (value) => <Typography variant="body2">{value}</Typography>,
    },
    {
      key: 'isFeatured',
      label: 'Featured',
      render: (value) => <Typography variant="body2">{value ? '✓' : '—'}</Typography>,
    },
    {
      key: 'isBestSeller',
      label: 'Best Seller',
      render: (value) => <Typography variant="body2">{value ? '✓' : '—'}</Typography>,
    },
    {
      key: 'isBestSelect',
      label: 'Best Select',
      render: (value) => <Typography variant="body2">{value ? '✓' : '—'}</Typography>,
    },
    {
      key: 'disabled',
      label: 'Disabled',
      render: (value) => <Typography variant="body2">{value ? '✓' : '—'}</Typography>,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => <Typography variant="body2">{value || 0}</Typography>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right' as const,
      render: (_, row) => (
        <IconButton onClick={(event) => handleOpenPopover(event, row)}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      ),
    },
  ];

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" flexGrow={1}>
          Products Management
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="table" aria-label="table view">
              <Iconify icon="custom:menu-duotone" />
            </ToggleButton>
            <ToggleButton value="card" aria-label="card view">
              <Iconify icon="solar:eye-bold" />
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => handleOpenDialog()}
          >
            New Product
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {viewMode === 'table' ? (
        <>
          <DataTable
            columns={tableColumns}
            data={products}
            loading={loading}
            emptyMessage="No products found"
            minWidth={1200}
          />
          {/* Pagination for table view */}
          {paginationMeta && paginationMeta.pages > 1 && (
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                mb: 2,
                gap: 2,
              }}
            >
              <Typography variant="body2" color="textSecondary">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, paginationMeta.total)} of{' '}
                {paginationMeta.total} items
              </Typography>
              <Pagination
                count={paginationMeta.pages}
                page={currentPage}
                onChange={(_, page) => handlePageChange(page)}
                showFirstButton
                showLastButton
                size="large"
              />
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={itemsPerPage}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  displayEmpty
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </>
      ) : (
        <Grid container spacing={3}>
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Box
                  sx={{
                    height: 400,
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CircularProgress />
                </Box>
              </Grid>
            ))
          ) : products.length === 0 ? (
            <Grid size={12}>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 6,
                  color: 'text.secondary',
                }}
              >
                <Typography variant="h6">No products found</Typography>
                <Typography variant="body2">Start by adding your first product</Typography>
              </Box>
            </Grid>
          ) : (
            products.map((product) => (
              <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <ProductItem product={convertToProductItem(product)} />
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Pagination for card view */}
      {viewMode === 'card' && paginationMeta && paginationMeta.pages > 1 && (
        <Box
          sx={{
            mt: 4,
            mb: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="textSecondary">
            {paginationMeta.total} items total
          </Typography>
          <Pagination
            count={paginationMeta.pages}
            page={currentPage}
            onChange={(_, page) => handlePageChange(page)}
            showFirstButton
            showLastButton
            size="large"
          />
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={itemsPerPage}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              displayEmpty
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Language Tabs */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Product Information
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

              {/* English Fields */}
              {activeLanguageTab === 'en' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Title (English)"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Enter product title in English"
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Description (English) *
                    </Typography>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                      placeholder="Enter product description in English..."
                      helperText="Use the toolbar above to format your description"
                    />
                  </Box>
                </Box>
              )}

              {/* Armenian Fields */}
              {activeLanguageTab === 'am' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Անվանում (Armenian)"
                    value={formData.titleAm}
                    onChange={(e) => setFormData((prev) => ({ ...prev, titleAm: e.target.value }))}
                    placeholder="Մուտքագրեք ապրանքի անվանումը հայերեն"
                    helperText="Optional - Leave empty if not needed"
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Նկարագրություն (Armenian)
                    </Typography>
                    <RichTextEditor
                      value={formData.descriptionAm}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, descriptionAm: value }))
                      }
                      placeholder="Մուտքագրեք ապրանքի նկարագրությունը հայերեն..."
                      helperText="Optional - Use the toolbar above to format your description"
                    />
                  </Box>
                </Box>
              )}

              {/* Russian Fields */}
              {activeLanguageTab === 'ru' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Название (Russian)"
                    value={formData.titleRu}
                    onChange={(e) => setFormData((prev) => ({ ...prev, titleRu: e.target.value }))}
                    placeholder="Введите название продукта на русском языке"
                    helperText="Optional - Leave empty if not needed"
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Описание (Russian)
                    </Typography>
                    <RichTextEditor
                      value={formData.descriptionRu}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, descriptionRu: value }))
                      }
                      placeholder="Введите описание продукта на русском языке..."
                      helperText="Optional - Use the toolbar above to format your description"
                    />
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
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
                  const value = parseInt(e.target.value, 10);
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

            <FormControl fullWidth>
              <InputLabel>Subcategory (Optional)</InputLabel>
              <Select
                value={formData.subcategoryId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subcategoryId: e.target.value }))
                }
                label="Subcategory (Optional)"
                disabled={!formData.categoryId || filteredSubcategories.length === 0}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {filteredSubcategories.map((subcategory) => (
                  <MenuItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.title}
                  </MenuItem>
                ))}
              </Select>
              {formData.categoryId && filteredSubcategories.length === 0 && (
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
                  No subcategories available for this category
                </Typography>
              )}
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
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.disabled || false}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, disabled: e.target.checked }))
                    }
                  />
                }
                label="Disabled"
              />
            </Box>

            <TextField
              fullWidth
              label="Priority"
              type="number"
              value={formData.priority}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setFormData((prev) => ({ ...prev, priority: Math.max(0, value) }));
              }}
              helperText="Higher priority products appear first (0 = no priority)"
              inputProps={{ min: 0 }}
              error={(formData.priority || 0) < 0 || isNaN(formData.priority || 0)}
            />

            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 2,
                }}
              >
                Product Images (Max 5) {!editingProduct && '*'}
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
                Upload Image
                <input
                  type="file"
                  accept="image/*"
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
                        src={`${imageUrl}`}
                        alt={`Existing ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
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
              !formData.description.replace(/<[^>]*>/g, '').trim() ||
              !formData.categoryId ||
              formData.price < 0 ||
              formData.stock < 0 ||
              isNaN(formData.price) ||
              isNaN(formData.stock) ||
              isNaN(formData.priority || 0) ||
              (!editingProduct &&
                (formData.image?.length || 0) + (formData.existingImages?.length || 0) === 0)
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

          {/* <MenuItem onClick={handleDeleteFromMenu} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem> */}
        </MenuList>
      </Popover>

      {imageToProcess && (
        <ImageCropper
          open={cropperOpen}
          onClose={handleCropperClose}
          onCropComplete={handleCropComplete}
          imageSrc={imageToProcess.src}
          fileName={imageToProcess.file.name}
        />
      )}
    </div>
  );
}
