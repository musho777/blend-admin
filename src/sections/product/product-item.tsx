import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

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
  images: string[];
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
    images: product.images,
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

  const renderStock = (
    <Chip
      label={`Stock: ${product.stock || 0}`}
      size="small"
      color={product.stock && product.stock > 0 ? 'success' : 'error'}
      sx={{ fontSize: '0.75rem', height: 20 }}
    />
  );

  const renderDescription = product.description ? (
    <Tooltip
      title={<div dangerouslySetInnerHTML={{ __html: product.description }} />}
      placement="top"
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 1,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden',
          lineHeight: 1.4,
          cursor: 'help',
        }}
        dangerouslySetInnerHTML={{ __html: product.description }}
      />
    </Tooltip>
  ) : null;

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
          height="300"
          image={product.coverUrl}
          alt={product.name}
          sx={{
            objectFit: 'cover',
            aspectRatio: '1/1',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
        <IconButton
          onClick={handleQuickView}
          disabled={!product.images || product.images.length === 0}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
          }}
        >
          <Iconify icon="solar:eye-bold" />
        </IconButton>
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          {renderPrice}
          {renderStock}
        </Box>

        {renderDescription}
      </CardContent>

      <ProductQuickViewDialog
        open={openQuickView}
        product={quickViewProduct}
        onClose={handleCloseQuickView}
      />
    </Card>
  );
}
