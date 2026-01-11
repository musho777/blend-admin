import type { Category, Subcategory } from 'src/services/api';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { apiService } from 'src/services/api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

interface SubcategoryFormData {
  title: string;
  titleAm: string;
  titleRu: string;
  categoryId: string;
}

export function SubcategoriesView() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState<SubcategoryFormData>({
    title: '',
    titleAm: '',
    titleRu: '',
    categoryId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeLanguageTab, setActiveLanguageTab] = useState<'en' | 'am' | 'ru'>('en');

  const fetchSubcategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getSubcategories();
      setSubcategories(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subcategories');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    }
  }, []);

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, [fetchSubcategories, fetchCategories]);

  const handleOpenDialog = (subcategory?: Subcategory) => {
    if (subcategory) {
      setEditingSubcategory(subcategory);
      setFormData({
        title: subcategory.title,
        titleAm: (subcategory as any).titleAm || '',
        titleRu: (subcategory as any).titleRu || '',
        categoryId: subcategory.categoryId,
      });
    } else {
      setEditingSubcategory(null);
      setFormData({
        title: '',
        titleAm: '',
        titleRu: '',
        categoryId: '',
      });
    }
    setActiveLanguageTab('en');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubcategory(null);
    setActiveLanguageTab('en');
    setFormData({
      title: '',
      titleAm: '',
      titleRu: '',
      categoryId: '',
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const dataToSend: any = {
        title: formData.title,
        categoryId: formData.categoryId,
      };

      // Add multi-language fields if they have values
      if (formData.titleAm) {
        dataToSend.titleAm = formData.titleAm;
      }
      if (formData.titleRu) {
        dataToSend.titleRu = formData.titleRu;
      }

      if (editingSubcategory) {
        await apiService.updateSubcategory(editingSubcategory.id, dataToSend);
      } else {
        await apiService.createSubcategory(dataToSend);
      }

      await fetchSubcategories();
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subcategory');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this subcategory? Products using it will remain but lose their subcategory assignment.'
      )
    ) {
      try {
        await apiService.deleteSubcategory(id);
        await fetchSubcategories();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete subcategory');
      }
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.title : 'Unknown';
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <Box sx={{ p: '0 20px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
        <Typography variant="h4" flexGrow={1}>
          Subcategories
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenDialog()}
        >
          New Subcategory
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
                  <TableCell>Category</TableCell>
                  <TableCell>Created Date</TableCell>
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
                ) : subcategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No subcategories found
                    </TableCell>
                  </TableRow>
                ) : (
                  subcategories.map((subcategory) => (
                    <TableRow key={subcategory.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{subcategory.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {getCategoryName(subcategory.categoryId)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {formatDate(subcategory.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog(subcategory)}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(subcategory.id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Language Tabs */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Subcategory Title
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
                <TextField
                  fullWidth
                  label="Title (English)"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="Enter subcategory title in English"
                />
              )}

              {/* Armenian Fields */}
              {activeLanguageTab === 'am' && (
                <TextField
                  fullWidth
                  label="Անվանում (Armenian)"
                  value={formData.titleAm}
                  onChange={(e) => setFormData((prev) => ({ ...prev, titleAm: e.target.value }))}
                  placeholder="Մուտքագրեք ենթակատեգորիայի անվանումը հայերեն"
                  helperText="Optional - Leave empty if not needed"
                />
              )}

              {/* Russian Fields */}
              {activeLanguageTab === 'ru' && (
                <TextField
                  fullWidth
                  label="Название (Russian)"
                  value={formData.titleRu}
                  onChange={(e) => setFormData((prev) => ({ ...prev, titleRu: e.target.value }))}
                  placeholder="Введите название подкатегории на русском языке"
                  helperText="Optional - Leave empty if not needed"
                />
              )}
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !formData.title.trim() || !formData.categoryId}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Saving...' : editingSubcategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
