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
}

const CROP_SIZE = 600;
const ASPECT_RATIO = 1;

function getInitialCrop(mediaWidth: number, mediaHeight: number) {
  return {
    unit: '%' as const,
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  };
}

function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<Blob> {
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

  const aspectRatio = pixelCrop.width / pixelCrop.height;
  canvas.width = CROP_SIZE;
  canvas.height = CROP_SIZE / aspectRatio;

  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        resolve(blob);
      },
      'image/jpeg',
      0.9
    );
  });
}

export function ImageCropper({
  open,
  onClose,
  onCropComplete,
  imageSrc,
  fileName,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [error, setError] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;

    if (width < CROP_SIZE || height < 100) {
      setError(`Image too small. Minimum width: ${CROP_SIZE}px`);
      return;
    }

    setError('');
    const crop = getInitialCrop(width, height);
    setCrop(crop);
    setCompletedCrop(crop);
  }, []);

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) {
      setError('Please select a crop area');
      return;
    }

    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      const croppedFile = new File([croppedBlob], fileName, {
        type: 'image/jpeg',
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
            Drag to select the crop area. The image will be resized to {CROP_SIZE}px width
            maintaining the original aspect ratio.
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
              aspect={ASPECT_RATIO}
              minWidth={CROP_SIZE}
              minHeight={CROP_SIZE}
              maxWidth={CROP_SIZE}
              maxHeight={CROP_SIZE}
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
            Final image will be {CROP_SIZE}px wide
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
