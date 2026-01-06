import { useState, useCallback } from 'react';

import { Box, alpha, useTheme, IconButton, Typography } from '@mui/material';

import { Iconify } from '../iconify';

import type { Banner } from '../../sections/banner/types';

interface BannerCarouselProps {
  banners: Banner[];
  autoPlayInterval?: number;
}

export function BannerCarousel({ banners, autoPlayInterval = 5000 }: BannerCarouselProps) {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeBanners = banners
    .filter((banner) => banner.isActive)
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  }, [activeBanners.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === activeBanners.length - 1 ? 0 : prev + 1));
  }, [activeBanners.length]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  if (activeBanners.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette.grey[500], 0.08),
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No active banners
        </Typography>
      </Box>
    );
  }

  const currentBanner = activeBanners[currentIndex];

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 400,
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: theme.shadows[4],
      }}
    >
      {/* Main Banner Image */}
      <Box
        component="a"
        href={currentBanner.url}
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
          position: 'relative',
          textDecoration: 'none',
          cursor: 'pointer',
        }}
      >
        <Box
          component="img"
          src={`https://blend-backend-production-0649.up.railway.app/${currentBanner.image}`}
          alt={currentBanner.text || 'Banner'}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />

        {/* Text Overlay */}
        {currentBanner.text && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: `linear-gradient(to top, ${alpha(theme.palette.common.black, 0.8)}, transparent)`,
              padding: 4,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {currentBanner.text}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: alpha(theme.palette.common.white, 0.8),
              '&:hover': {
                bgcolor: theme.palette.common.white,
              },
            }}
          >
            <Iconify icon={'eva:arrow-ios-back-fill' as any} />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: alpha(theme.palette.common.white, 0.8),
              '&:hover': {
                bgcolor: theme.palette.common.white,
              },
            }}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </IconButton>
        </>
      )}

      {/* Dots Indicator */}
      {activeBanners.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
          }}
        >
          {activeBanners.map((_, index) => (
            <Box
              key={index}
              onClick={() => handleDotClick(index)}
              sx={{
                width: currentIndex === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor:
                  currentIndex === index
                    ? theme.palette.common.white
                    : alpha(theme.palette.common.white, 0.5),
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: theme.palette.common.white,
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
