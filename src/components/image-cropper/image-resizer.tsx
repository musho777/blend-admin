import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from 'src/components/iconify';

interface ImageResizerProps {
  open: boolean;
  onClose: () => void;
  onResizeComplete: (resizedFile: File) => void;
  imageSrc: string;
  fileName: string;
  maxWidth?: number;
  maxHeight?: number;
}

const DEFAULT_MAX_SIZE = 800;

function resizeImageWithZoom(
  imageSrc: string,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }

      // Canvas is always fixed size
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Transparent background (no fill needed for PNG)

      // Calculate image dimensions to fit in canvas
      let { width, height } = img;
      const aspectRatio = width / height;

      // First, fit image to canvas maintaining aspect ratio
      if (width > canvasWidth || height > canvasHeight) {
        if (width / canvasWidth > height / canvasHeight) {
          width = canvasWidth;
          height = width / aspectRatio;
        } else {
          height = canvasHeight;
          width = height * aspectRatio;
        }
      }

      // Apply zoom to the fitted dimensions
      width = width * zoom;
      height = height * zoom;

      // Center the image on canvas
      const x = (canvasWidth - width) / 2;
      const y = (canvasHeight - height) / 2;

      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x, y, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        },
        'image/png',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageSrc;
  });
}

export function ImageResizer({
  open,
  onClose,
  onResizeComplete,
  imageSrc,
  fileName,
  maxWidth = DEFAULT_MAX_SIZE,
  maxHeight = DEFAULT_MAX_SIZE,
}: ImageResizerProps) {
  const [customMaxWidth, setCustomMaxWidth] = useState(maxWidth);
  const [customMaxHeight, setCustomMaxHeight] = useState(maxHeight);
  const [quality, setQuality] = useState(90);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResize = async () => {
    if (!imageSrc) {
      setError('No image provided');
      return;
    }

    if (customMaxWidth < 1 || customMaxHeight < 1) {
      setError('Width and height must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const resizedBlob = await resizeImageWithZoom(
        imageSrc,
        customMaxWidth,
        customMaxHeight,
        zoom,
        quality / 100
      );

      const resizedFile = new File([resizedBlob], fileName, {
        type: 'image/png',
        lastModified: Date.now(),
      });

      onResizeComplete(resizedFile);
      onClose();
    } catch (err) {
      setError('Failed to resize image');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setLoading(false);
    setZoom(1);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Resize Image (Zoom & Pan)</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Use mouse wheel to zoom in/out. Zoom out creates blank space around the image. Final size is always {customMaxWidth}x{customMaxHeight}px.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            sx={{
              mb: 3,
              minHeight: '400px',
              maxHeight: '400px',
              border: '1px solid #ddd',
              borderRadius: 1,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TransformWrapper
              initialScale={1}
              minScale={0.1}
              maxScale={3}
              onTransformed={(ref) => {
                setZoom(ref.state.scale);
              }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1000,
                      display: 'flex',
                      gap: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 1,
                      p: 0.5,
                    }}
                  >
                    <IconButton onClick={() => zoomIn()} size="small">
                      <Iconify icon="solar:add-circle-bold" />
                    </IconButton>
                    <IconButton onClick={() => zoomOut()} size="small">
                      <Iconify icon="solar:minus-circle-bold" />
                    </IconButton>
                    <IconButton onClick={() => resetTransform()} size="small">
                      <Iconify icon="solar:restart-bold" />
                    </IconButton>
                  </Box>
                  <TransformComponent
                    wrapperStyle={{
                      width: '100%',
                      height: '400px',
                      cursor: 'grab',
                    }}
                    contentStyle={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                      }}
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
              Current Zoom: {(zoom * 100).toFixed(0)}%
            </Typography>
            <Slider
              value={zoom}
              onChange={(_, value) => setZoom(value as number)}
              min={0.1}
              max={3}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
              disabled
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Maximum Width (px)
            </Typography>
            <TextField
              type="number"
              value={customMaxWidth}
              onChange={(e) => setCustomMaxWidth(Number(e.target.value))}
              fullWidth
              size="small"
              inputProps={{ min: 1 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Maximum Height (px)
            </Typography>
            <TextField
              type="number"
              value={customMaxHeight}
              onChange={(e) => setCustomMaxHeight(Number(e.target.value))}
              fullWidth
              size="small"
              inputProps={{ min: 1 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Quality: {quality}%
            </Typography>
            <Slider
              value={quality}
              onChange={(_, value) => setQuality(value as number)}
              min={10}
              max={100}
              step={10}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Typography variant="caption" color="textSecondary">
            Final image will always be {customMaxWidth}x{customMaxHeight}px. At {(zoom * 100).toFixed(0)}% zoom, the image will be centered with transparent space around it.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleResize} variant="contained" disabled={loading}>
          {loading ? 'Resizing...' : 'Resize & Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
