import 'react-image-crop/dist/ReactCrop.css';

import React, { useRef, useState, useCallback } from 'react';
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
} from 'react-image-crop';

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

const CROP_SIZE = 300;
const ASPECT_RATIO = 1;

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const pixelCrop = convertToPixelCrop(crop, image.naturalWidth, image.naturalHeight);

  canvas.width = CROP_SIZE;
  canvas.height = CROP_SIZE;

  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    CROP_SIZE,
    CROP_SIZE
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

    if (width < CROP_SIZE || height < CROP_SIZE) {
      setError(`Image too small. Minimum size: ${CROP_SIZE}x${CROP_SIZE}px`);
      return;
    }

    setError('');
    const crop = centerAspectCrop(width, height, ASPECT_RATIO);
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
            Drag to move the crop area. The image will be resized to {CROP_SIZE}x{CROP_SIZE} pixels
            for optimal product display.
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
              circularCrop={false}
              locked
            >
              <img
                ref={imgRef}
                src={imageSrc}
                style={{ maxWidth: '100%', maxHeight: '400px' }}
                onLoad={onImageLoad}
                alt="Crop preview"
              />
            </ReactCrop>
          </Box>

          <Typography variant="caption" color="textSecondary">
            Final image will be {CROP_SIZE}x{CROP_SIZE}px
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
