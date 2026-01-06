import type { Order } from 'src/services/api';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { apiService } from 'src/services/api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
} as const;

export function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : undefined;
      const response = await apiService.getOrders(params);
      setOrders(response.orders);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      setUpdatingStatus(true);
      await apiService.updateOrderStatus(orderId, newStatus);
      await fetchOrders();

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await apiService.deleteOrder(orderId);
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          handleCloseDialog();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete order');
      }
    }
  };

  return (
    <Box sx={{ p: '0 20px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
        <Typography variant="h4" flexGrow={1}>
          Orders
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status Filter"
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{order.id}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{order.customerName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {order.customerEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">${order.total.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={order.status}
                          color={STATUS_COLORS[order.status] as any}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleViewOrder(order)}>
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteOrder(order.id)}
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
        <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Customer Information
                  </Typography>
                  <Typography variant="body2">Name: {selectedOrder.customerName}</Typography>
                  <Typography variant="body2">Email: {selectedOrder.customerEmail}</Typography>
                  <Typography variant="body2">Phone: {selectedOrder.customerPhone}</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Order Information
                  </Typography>
                  <Typography variant="body2">Order #: {selectedOrder.orderNumber}</Typography>
                  <Typography variant="body2">
                    Created: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={selectedOrder.status}
                        onChange={(e) =>
                          handleStatusChange(selectedOrder.id, e.target.value as Order['status'])
                        }
                        label="Status"
                        disabled={updatingStatus}
                      >
                        {STATUS_OPTIONS.slice(1).map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {selectedOrder?.shippingAddress && (
                  <>
                    {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city},{' '}
                    {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode},{' '}
                    {selectedOrder.shippingAddress.country}
                  </>
                )}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productTitle}</TableCell>
                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.totalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
