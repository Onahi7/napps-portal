import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, RotateCcw, Check, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import { Label } from './label';
import { uploadBase64ToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';

interface CameraCaptureProps {
  label?: string;
  value?: string; // Cloudinary URL
  onChange: (imageUrl: string | null) => void;
  accept?: string;
  maxSizeMB?: number;
  required?: boolean;
  error?: string;
  folder?: string; // Cloudinary folder
}

export const CameraCapture = ({
  label = "Capture Photo",
  value,
  onChange,
  accept = "image/*",
  maxSizeMB = 5,
  required = false,
  error,
  folder = "napps/proprietors"
}: CameraCaptureProps) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', // Front camera for selfie/passport
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please grant camera permissions or use file upload.');
    }
  };

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  }, [stream]);

  // Capture photo from camera
  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        canvas.toBlob(async (blob) => {
          if (blob) {
            setUploading(true);
            try {
              // Convert blob to base64 for preview
              const reader = new FileReader();
              reader.onloadend = async () => {
                const base64 = reader.result as string;
                setPreview(base64);
                
                // Upload to Cloudinary
                try {
                  const result = await uploadBase64ToCloudinary(base64, folder);
                  onChange(result.secure_url);
                  toast.success('Photo uploaded successfully!');
                  stopCamera();
                } catch (error) {
                  console.error('Upload error:', error);
                  toast.error('Failed to upload photo. Please try again.');
                  setPreview(null);
                }
              };
              reader.readAsDataURL(blob);
            } catch (error) {
              console.error('Capture error:', error);
              toast.error('Failed to capture photo. Please try again.');
            } finally {
              setUploading(false);
            }
          }
        }, 'image/jpeg', 0.85);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPreview(base64);
        
        // Upload to Cloudinary
        try {
          const result = await uploadBase64ToCloudinary(base64, folder);
          onChange(result.secure_url);
          toast.success('Photo uploaded successfully!');
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload photo. Please try again.');
          setPreview(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File read error:', error);
      toast.error('Failed to read file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Remove photo
  const removePhoto = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Retake photo
  const retakePhoto = () => {
    removePhoto();
    startCamera();
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {!preview && !showCamera && (
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Camera Button */}
          <Button
            type="button"
            variant="outline"
            onClick={startCamera}
            className="flex-1 h-auto py-4"
            disabled={uploading}
          >
            <Camera className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-medium">Take Photo</div>
              <div className="text-xs text-muted-foreground">Use camera</div>
            </div>
          </Button>

          {/* File Upload Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 h-auto py-4"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <div className="text-left">
                  <div className="font-medium">Uploading...</div>
                  <div className="text-xs text-muted-foreground">Please wait</div>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Upload Photo</div>
                  <div className="text-xs text-muted-foreground">From gallery</div>
                </div>
              </>
            )}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </div>
      )}

      {/* Camera View */}
      {showCamera && (
        <Card className="p-4 space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={capturePhoto}
              className="flex-1"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Capture
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={stopCamera}
              disabled={uploading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Preview */}
      {preview && !showCamera && (
        <Card className="p-4 space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto rounded-lg border-2 border-border"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={retakePhoto}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={removePhoto}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <p className="text-xs text-red-500 flex items-start gap-1">
          <span className="text-red-500 mt-0.5">⚠</span>
          <span>{error}</span>
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Maximum file size: {maxSizeMB}MB. Accepted formats: JPG, PNG
      </p>
    </div>
  );
};
