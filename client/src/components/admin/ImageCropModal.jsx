import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  RotateCcw as ResetIcon,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from 'lucide-react';
import uploadService from '../../services/uploadService';

/**
 * Professional 1:1 Square Image Crop Modal
 * Supports:
 * - Device gallery / file picker
 * - 1:1 Aspect ratio square crop boundary
 * - Zoom slider & buttons (0.5x to 3x)
 * - 90-degree Rotation (Left & Right)
 * - Pan / Drag image inside square
 * - Reset adjustments
 * - High-res Canvas export
 * - Direct upload to backend / Cloudinary
 */
const ImageCropModal = ({
  isOpen,
  onClose,
  initialImageFile = null,
  initialImageUrl = null,
  colorName = '',
  onCropComplete,
  folder = 'slipper-store/products',
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState(null);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load image when file or URL changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialImageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        resetTransforms();
      };
      reader.readAsDataURL(initialImageFile);
    } else if (initialImageUrl) {
      setImageSrc(initialImageUrl);
      resetTransforms();
    } else {
      setImageSrc(null);
      resetTransforms();
    }
  }, [isOpen, initialImageFile, initialImageUrl]);

  const resetTransforms = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setPreviewUrl(null);
    setShowPreviewModal(false);
    setCroppedBlob(null);
  };

  // Handle file selection from local device gallery
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      resetTransforms();
    };
    reader.readAsDataURL(file);
  };

  // Pan / Drag Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers for Mobile Devices
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const rotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const rotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));

  // Generate 1:1 Square Cropped Canvas
  const generateCroppedCanvas = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!imageSrc) return reject('No image loaded');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const CROP_SIZE = 1000; // 1000x1000 square high resolution
        const canvas = document.createElement('canvas');
        canvas.width = CROP_SIZE;
        canvas.height = CROP_SIZE;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);

        ctx.save();
        // Translate to center
        ctx.translate(CROP_SIZE / 2, CROP_SIZE / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        // Account for pan offset mapped to canvas coordinate space
        const displayScale = CROP_SIZE / 320; // 320px is the visual preview square size
        const panX = offset.x * displayScale;
        const panY = offset.y * displayScale;

        // Draw image centered
        const rad = (rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(rad));
        const cos = Math.abs(Math.cos(rad));
        const drawWidth = img.width;
        const drawHeight = img.height;

        // Scale image to fit square initially
        const minDimension = Math.min(img.width, img.height);
        const baseScale = CROP_SIZE / minDimension;

        ctx.drawImage(
          img,
          - (drawWidth * baseScale) / 2 + panX / zoom,
          - (drawHeight * baseScale) / 2 + panY / zoom,
          drawWidth * baseScale,
          drawHeight * baseScale
        );

        ctx.restore();

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject('Canvas blob generation failed');
            const croppedUrl = URL.createObjectURL(blob);
            resolve({ blob, croppedUrl, canvas });
          },
          'image/jpeg',
          0.92
        );
      };
      img.onerror = (err) => reject(err);
      img.src = imageSrc;
    });
  }, [imageSrc, zoom, rotation, offset]);

  // Preview Cropped Result
  const handlePreviewCrop = async () => {
    try {
      const { blob, croppedUrl } = await generateCroppedCanvas();
      setCroppedBlob(blob);
      setPreviewUrl(croppedUrl);
      setShowPreviewModal(true);
    } catch (err) {
      console.error('Crop preview error:', err);
    }
  };

  // Upload and Confirm Cropped Image
  const handleConfirmAndUpload = async () => {
    try {
      setIsUploading(true);
      let blobToUpload = croppedBlob;

      if (!blobToUpload) {
        const result = await generateCroppedCanvas();
        blobToUpload = result.blob;
      }

      const file = new File([blobToUpload], `slipper-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      // Upload to backend Cloudinary API
      let finalUrl = null;
      try {
        const uploadRes = await uploadService.uploadImage(file, folder);
        if (uploadRes?.data?.image?.url) {
          finalUrl = uploadRes.data.image.url;
        }
      } catch (uploadErr) {
        console.warn('Backend upload skipped / offline fallback, using local URL:', uploadErr.message);
        // Fallback: convert to base64 data URL for local storage
        finalUrl = await new Promise((res) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result);
          reader.readAsDataURL(blobToUpload);
        });
      }

      if (onCropComplete) {
        onCropComplete({
          url: finalUrl,
          colorName: colorName || null,
          isPrimary: false,
          altText: colorName ? `${colorName} slipper angle view` : 'Slipper angle view',
        });
      }

      onClose();
    } catch (err) {
      console.error('Failed to complete image crop upload:', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl z-10 animate-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-luxury-accent/20 border border-luxury-accent/40 text-luxury-accent flex items-center justify-center font-black">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-white flex items-center gap-2">
                1:1 Square Photo Cropper
                {colorName && (
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-luxury-accent/20 text-luxury-accent rounded-md border border-luxury-accent/30 font-bold">
                    {colorName}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-stone-400">
                Position & crop the slipper perfectly for cards and gallery display.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Crop Area */}
        <div className="py-4 space-y-4">
          {!imageSrc ? (
            /* Upload from Device Gallery Picker */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-700 hover:border-luxury-accent rounded-2xl p-8 text-center cursor-pointer bg-stone-950/60 hover:bg-stone-950 transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-stone-800 group-hover:bg-luxury-accent/20 text-stone-400 group-hover:text-luxury-accent flex items-center justify-center transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Choose Photo from Device Gallery</span>
                <span className="text-[11px] text-stone-400">Supports JPG, PNG, WEBP up to 5MB</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <>
              {/* Interactive Cropper Box */}
              <div className="flex flex-col items-center">
                <div
                  ref={containerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="relative w-72 h-72 sm:w-80 sm:h-80 bg-stone-950 rounded-2xl overflow-hidden cursor-move border-2 border-luxury-accent/60 shadow-2xl select-none touch-none flex items-center justify-center"
                >
                  {/* Image being transformed */}
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="To Crop"
                    draggable={false}
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: 'center center',
                      maxWidth: 'none',
                    }}
                    className="pointer-events-none transition-transform duration-75 object-contain"
                  />

                  {/* 1:1 Square Grid & Corner Marks */}
                  <div className="absolute inset-0 border border-white/20 pointer-events-none grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-b border-white/10" />
                    <div className="border-r border-white/10" />
                    <div className="border-r border-white/10" />
                    <div />
                  </div>

                  {/* Corner Accent Handles */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-luxury-accent pointer-events-none" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-luxury-accent pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-luxury-accent pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-luxury-accent pointer-events-none" />
                </div>
                <span className="text-[10px] text-stone-500 mt-2 font-mono">
                  Drag to pan • 1:1 Square Aspect Ratio
                </span>
              </div>

              {/* Transformation Controls Bar */}
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3 space-y-3">
                {/* Zoom Slider */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={zoomOut}
                    className="p-1.5 bg-stone-900 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-white"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-luxury-accent h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />

                  <button
                    type="button"
                    onClick={zoomIn}
                    className="p-1.5 bg-stone-900 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-white"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] font-mono text-stone-400 w-10 text-right">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                {/* Rotation & Reset Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={rotateLeft}
                      className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 rounded-xl text-stone-300 flex items-center gap-1 font-bold text-[11px]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Rotate -90°
                    </button>
                    <button
                      type="button"
                      onClick={rotateRight}
                      className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 rounded-xl text-stone-300 flex items-center gap-1 font-bold text-[11px]"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Rotate +90°
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetTransforms}
                      className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-stone-200 flex items-center gap-1 text-[11px]"
                      title="Reset Transforms"
                    >
                      <ResetIcon className="w-3.5 h-3.5" /> Reset
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setImageSrc(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-2.5 py-1.5 text-rose-400 hover:bg-rose-950/40 rounded-xl text-[11px] font-bold"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold text-xs"
          >
            Cancel
          </button>

          {imageSrc && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviewCrop}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl"
              >
                Preview Crop
              </button>

              <button
                type="button"
                onClick={handleConfirmAndUpload}
                disabled={isUploading}
                className="px-6 py-2 bg-luxury-accent hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-glow"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing & Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Apply & Save Photo</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested Preview Modal */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <h4 className="font-bold text-sm text-white">Cropped 1:1 Square Preview</h4>
            <div className="w-64 h-64 mx-auto rounded-2xl overflow-hidden border-2 border-luxury-accent shadow-2xl bg-white">
              <img src={previewUrl} alt="Cropped Preview" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-stone-400">
              This exact square photo will be presented on product cards and color galleries.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl font-bold text-xs"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  handleConfirmAndUpload();
                }}
                disabled={isUploading}
                className="px-5 py-2 bg-luxury-accent text-stone-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-glow"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Confirm & Use
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCropModal;
