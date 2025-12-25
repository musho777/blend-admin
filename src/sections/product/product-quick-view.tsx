import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { ColorPreview } from 'src/components/color-utils';

// ----------------------------------------------------------------------

export interface ProductQuickViewProps {
  id: string;
  name: string;
  price: number;
  status: string;
  images: string[];
  colors: string[];
  priceSale: number | null;
  description?: string;
  stock?: number;
  category?: string;
}

interface ProductQuickViewDialogProps {
  open: boolean;
  product: ProductQuickViewProps | null;
  onClose: () => void;
}

export function ProductQuickViewDialog({ open, product, onClose }: ProductQuickViewDialogProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) return null;

  const images =
    product.images.length > 0
      ? product.images
      : [product.images[0] || '/assets/images/product/product-1.webp'];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 9,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Image Section */}
          <Box sx={{ flex: 1, position: 'relative', bgcolor: 'grey.50' }}>
            {/* Main Image */}
            <Box sx={{ position: 'relative', aspectRatio: '1/1' }}>
              <Box
                component="img"
                src={images[selectedImageIndex]}
                alt={product.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Status Badge */}
              {product.status && (
                <Chip
                  label={product.status.toUpperCase()}
                  color={product.status === 'sale' ? 'error' : 'primary'}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    fontWeight: 600,
                  }}
                />
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrevImage}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                  >
                    <Iconify icon="eva:arrow-ios-forward-fill" style={{ transform: 'rotate(180deg)' }} />
                  </IconButton>
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                  >
                    <Iconify icon="eva:arrow-ios-forward-fill" />
                  </IconButton>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: 14,
                  }}
                >
                  {selectedImageIndex + 1} / {images.length}
                </Box>
              )}
            </Box>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  p: 2,
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: 4,
                  },
                }}
              >
                {images.map((image, index) => (
                  <Box
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    sx={{
                      width: 80,
                      height: 80,
                      flexShrink: 0,
                      border: selectedImageIndex === index ? '2px solid' : '2px solid transparent',
                      borderColor: selectedImageIndex === index ? 'primary.main' : 'transparent',
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.light',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Product Info Section */}
          <Box sx={{ flex: 1, p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {product.name}
                </Typography>

                {product.category && (
                  <Typography variant="body2" color="text.secondary">
                    {product.category}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {product.priceSale && (
                    <Typography
                      component="span"
                      variant="h6"
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
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Available Colors
                </Typography>
                <ColorPreview colors={product.colors} />
              </Box>

              {product.stock !== undefined && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Stock: <strong>{product.stock}</strong> units available
                  </Typography>
                </Box>
              )}

              {product.description && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Description
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    component="div"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                    sx={{
                      '& p': { margin: 0, marginBottom: 1 },
                      '& h1, & h2, & h3, & h4, & h5, & h6': { margin: 0, marginBottom: 0.5, marginTop: 1 },
                      '& ul, & ol': { paddingLeft: 2, margin: 0 },
                      '& li': { marginBottom: 0.25 }
                    }}
                  />
                </Box>
              )}

              <Divider />
            </Stack>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
