import type { Category, Subcategory } from 'src/services/api';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
    categoryId: '',
  });
  const [submitting, setSubmitting] = useState(false);

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
        categoryId: subcategory.categoryId,
      });
    } else {
      setEditingSubcategory(null);
      setFormData({
        title: '',
        categoryId: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubcategory(null);
    setFormData({
      title: '',
      categoryId: '',
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (editingSubcategory) {
        await apiService.updateSubcategory(editingSubcategory.id, formData);
      } else {
        await apiService.createSubcategory(formData);
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />

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
