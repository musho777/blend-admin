import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ColorPreview } from 'src/components/color-utils';

import { ProductQuickViewDialog, type ProductQuickViewProps } from './product-quick-view';

// ----------------------------------------------------------------------

export type ProductItemProps = {
  id: string;
  name: string;
  price: number;
  status: string;
  coverUrl: string;
  colors: string[];
  priceSale: number | null;
  images?: string[];
  description?: string;
  stock?: number;
  category?: string;
};

export function ProductItem({ product }: { product: ProductItemProps }) {
  const [openQuickView, setOpenQuickView] = useState(false);

  const handleQuickView = () => {
    setOpenQuickView(true);
  };

  const handleCloseQuickView = () => {
    setOpenQuickView(false);
  };

  const quickViewProduct: ProductQuickViewProps = {
    id: product.id,
    name: product.name,
    price: product.price,
    status: product.status,
    images: product.images || [product.coverUrl],
    colors: product.colors,
    priceSale: product.priceSale,
    description: product.description,
    stock: product.stock,
    category: product.category,
  };
  const renderStatus = (
    <Label
      variant="inverted"
      color={(product.status === 'sale' && 'error') || 'info'}
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
      {product.status}
    </Label>
  );

  const renderPrice = (
    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
      {product.priceSale && (
        <Typography
          component="span"
          variant="body2"
          sx={{
            color: 'text.disabled',
            textDecoration: 'line-through',
            mr: 1,
          }}
        >
          {fCurrency(product.priceSale)}
        </Typography>
      )}
      {fCurrency(product.price)}
    </Typography>
  );

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows.z8,
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {product.status && renderStatus}
        <CardMedia
          component="img"
          height="240"
          image={product.coverUrl}
          alt={product.name}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            mb: 1,
            minHeight: '2.5em',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
            lineHeight: 1.25,
          }}
        >
          {product.name}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <ColorPreview colors={product.colors} />
        </Box>

        {renderPrice}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Tooltip title="Add to cart">
          <IconButton
            color="primary"
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <Iconify icon="solar:cart-plus-bold" />
          </IconButton>
        </Tooltip>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Add to wishlist">
            <IconButton size="small">
              <Iconify icon="solar:heart-linear" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Quick view">
            <IconButton size="small" onClick={handleQuickView}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>

      <ProductQuickViewDialog
        open={openQuickView}
        product={quickViewProduct}
        onClose={handleCloseQuickView}
      />
    </Card>
  );
}
