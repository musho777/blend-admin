import 'react-image-crop/dist/ReactCrop.css';

import ReactCrop, { type Crop } from 'react-image-crop';
import React, { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
  imageSrc: string;
  fileName: string;
  cropWidth?: number;
  cropHeight?: number;
}

const DEFAULT_CROP_SIZE = 800;
const DEFAULT_ASPECT_RATIO = 1;

function getInitialCrop(mediaWidth: number, mediaHeight: number, cropWidth: number, cropHeight: number) {
  return {
    unit: 'px' as const,
    x: 10,
    y: 10,
    width: cropWidth,
    height: cropHeight,
  };
}

function getCroppedImg(image: HTMLImageElement, crop: Crop, cropWidth: number, cropHeight: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const pixelCrop = {
    x: crop.x * scaleX,
    y: crop.y * scaleY,
    width: crop.width * scaleX,
    height: crop.height * scaleY,
  };

  canvas.width = cropWidth;
  canvas.height = cropHeight;

  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        resolve(blob);
      },
      'image/png'
    );
  });
}

export function ImageCropper({
  open,
  onClose,
  onCropComplete,
  imageSrc,
  fileName,
  cropWidth = DEFAULT_CROP_SIZE,
  cropHeight = DEFAULT_CROP_SIZE,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [error, setError] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  const aspectRatio = cropWidth / cropHeight;

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;

    if (width < cropWidth || height < cropHeight) {
      setError(`Image too small. Minimum dimensions: ${cropWidth}x${cropHeight}px`);
      return;
    }

    setError('');
    const crops = getInitialCrop(width, height, cropWidth, cropHeight);
    setCrop(crops);
    setCompletedCrop(crops);
  }, [cropWidth, cropHeight]);

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) {
      setError('Please select a crop area');
      return;
    }

    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop, cropWidth, cropHeight);
      const croppedFile = new File([croppedBlob], fileName, {
        type: 'image/png',
        lastModified: Date.now(),
      });
      onCropComplete(croppedFile);
      onClose();
    } catch (err) {
      setError('Failed to crop image');
    }
  };

  const handleClose = () => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Crop Image</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Drag to select the crop area. The image will be resized to {cropWidth}x{cropHeight}px.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              minWidth={cropWidth}
              minHeight={cropHeight}
              maxWidth={cropWidth}
              maxHeight={cropHeight}
              keepSelection
              ruleOfThirds
              locked
            >
              <img
                ref={imgRef}
                src={imageSrc}
                style={{ maxWidth: '100%', height: 'auto' }}
                onLoad={onImageLoad}
                alt="Crop preview"
              />
            </ReactCrop>
          </Box>

          <Typography variant="caption" color="textSecondary">
            Final image will be {cropWidth}x{cropHeight} pixels
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleCropComplete}
          variant="contained"
          disabled={!completedCrop || !!error}
        >
          Crop & Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
