import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import { Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageCropModalProps {
  open: boolean;
  onClose: () => void;
  imageFile: File | null;
  onConfirm: (croppedFile: File) => void;
  isUploading?: boolean;
}

const CROP_SIZE = 200;
const OUTPUT_SIZE = 200;

export function ImageCropModal({
  open,
  onClose,
  imageFile,
  onConfirm,
  isUploading = false,
}: ImageCropModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);

      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });

        const minDim = Math.min(img.naturalWidth, img.naturalHeight);
        const initialZoom = CROP_SIZE / minDim;
        setZoom(Math.max(initialZoom, 0.5));
        setImageLoaded(true);
      };
      img.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    if (imageRef.current) {
      const img = imageRef.current;
      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      const initialZoom = CROP_SIZE / minDim;
      setZoom(Math.max(initialZoom, 0.5));
    } else {
      setZoom(1);
    }
    setPosition({ x: 0, y: 0 });
  };

  const handleConfirm = async () => {
    if (!imageRef.current || !canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const img = imageRef.current;
    const scaledWidth = naturalSize.width * zoom;
    const scaledHeight = naturalSize.height * zoom;

    const imgX = (CROP_SIZE - scaledWidth) / 2 + position.x;
    const imgY = (CROP_SIZE - scaledHeight) / 2 + position.y;

    const scaleRatio = OUTPUT_SIZE / CROP_SIZE;

    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      imgX * scaleRatio,
      imgY * scaleRatio,
      scaledWidth * scaleRatio,
      scaledHeight * scaleRatio,
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "profile-photo.png", { type: "image/png" });
          onConfirm(file);
        }
      },
      "image/png",
      0.95,
    );
  };

  const scaledWidth = naturalSize.width * zoom;
  const scaledHeight = naturalSize.height * zoom;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar foto de perfil</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div
            className="relative cursor-move overflow-hidden rounded-full bg-muted"
            style={{ width: CROP_SIZE, height: CROP_SIZE }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="pointer-events-none absolute select-none"
                style={{
                  width: scaledWidth,
                  height: scaledHeight,
                  maxWidth: "none",
                  maxHeight: "none",
                  left: (CROP_SIZE - scaledWidth) / 2 + position.x,
                  top: (CROP_SIZE - scaledHeight) / 2 + position.y,
                }}
                draggable={false}
              />
            )}
          </div>

          <p className="text-sm text-muted-foreground">Arraste para posicionar a imagem</p>

          <div className="flex w-full max-w-xs items-center gap-3">
            <ZoomOut className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <Slider
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
              min={0.1}
              max={3}
              step={0.05}
              className="flex-1"
              data-testid="slider-zoom"
            />
            <ZoomIn className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground"
            data-testid="button-reset-position"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Resetar posição
          </Button>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
            data-testid="button-cancel-crop"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isUploading || !imageLoaded}
            data-testid="button-confirm-crop"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
