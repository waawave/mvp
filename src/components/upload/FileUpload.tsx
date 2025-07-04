import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, AlertTriangle } from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
  error?: string;
  isProcessing?: boolean;
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  photographerName: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange, photographerName }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const VALIDATION_RULES = {
    maxSessionSize: 1 * 1024 * 1024 * 1024, // 1GB
    maxFiles: 150,
    maxFileSize: 20 * 1024 * 1024, // 20MB
    minImageResolution: 12, // 12MP
    minVideoResolution: 1080, // 1080p
    supportedImageFormats: ['image/jpeg', 'image/png', 'image/heic'],
    supportedVideoFormats: ['video/mp4', 'video/mov']
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > VALIDATION_RULES.maxFileSize) {
      return 'File size exceeds 20MB limit';
    }

    // Check file type
    const isImage = VALIDATION_RULES.supportedImageFormats.includes(file.type);
    const isVideo = VALIDATION_RULES.supportedVideoFormats.includes(file.type);
    
    if (!isImage && !isVideo) {
      return 'Unsupported file format';
    }

    return null;
  };

  const validateImageResolution = (width: number, height: number): string | null => {
    const megapixels = (width * height) / 1000000;
    if (megapixels < VALIDATION_RULES.minImageResolution) {
      return 'Image quality too low (minimum 12MP required)';
    }
    return null;
  };

  const validateVideoResolution = (width: number, height: number): string | null => {
    if (height < VALIDATION_RULES.minVideoResolution) {
      return 'Video resolution too low (minimum 1080p required)';
    }
    return null;
  };

  const createImagePreview = (file: File): Promise<{ preview: string; width: number; height: number; error?: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        const { width: originalWidth, height: originalHeight } = img;
        
        // Validate resolution
        const resolutionError = validateImageResolution(originalWidth, originalHeight);
        
        // Calculate preview dimensions (450px max width/height, maintain ratio)
        let previewWidth, previewHeight;
        if (originalWidth > originalHeight) {
          previewWidth = Math.min(400, originalWidth);
          previewHeight = (originalHeight * previewWidth) / originalWidth;
        } else {
          previewHeight = Math.min(400, originalHeight);
          previewWidth = (originalWidth * previewHeight) / originalHeight;
        }
        
        canvas.width = previewWidth;
        canvas.height = previewHeight;
        
        // Draw the image
        ctx?.drawImage(img, 0, 0, previewWidth, previewHeight);
        
        // Add watermark
        if (ctx) {
          // Save the current context state
          ctx.save();
          
          // Set watermark properties
          ctx.globalAlpha = 0.4; // 50% opacity
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Calculate font sizes based on canvas size
          const baseFontSize = Math.min(previewWidth, previewHeight) * 0.05; // 4% of smallest dimension
          const mainFontSize = Math.max(22, baseFontSize);
          const subFontSize = Math.max(16, baseFontSize * 0.75);
          
          // Position watermark in center
          const centerX = previewWidth / 2;
          const centerY = previewHeight / 2;
          
          // Draw main watermark text "waawave.com"
          ctx.font = `bold ${mainFontSize}px Arial, sans-serif`;
          ctx.fillText('waawave.com', centerX, centerY - subFontSize / 2);
          
          // Draw photographer credit
          ctx.font = `${subFontSize}px Arial, sans-serif`;
          ctx.fillText(`Photo by ${photographerName}`, centerX, centerY + mainFontSize / 2);
          
          // Restore the context state
          ctx.restore();
        }
        
        const preview = canvas.toDataURL('image/jpeg', 0.8);
        
        resolve({
          preview,
          width: originalWidth,
          height: originalHeight,
          error: resolutionError || undefined
        });
      };
      
      img.onerror = () => {
        resolve({
          preview: '',
          width: 0,
          height: 0,
          error: 'Failed to load image'
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const createVideoPreview = (file: File): Promise<{ preview: string; width: number; height: number; error?: string; previewBlob?: Blob }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      
      video.onloadedmetadata = async () => {
        const { videoWidth, videoHeight, duration } = video;
        
        // Validate resolution
        const resolutionError = validateVideoResolution(videoWidth, videoHeight);
        
        // Calculate low-resolution preview dimensions (max 240p for videos)
        const maxPreviewHeight = 240;
        let previewWidth, previewHeight;
        
        if (videoWidth > videoHeight) {
          // Landscape video
          previewHeight = Math.min(maxPreviewHeight, videoHeight);
          previewWidth = (videoWidth * previewHeight) / videoHeight;
        } else {
          // Portrait or square video
          previewHeight = Math.min(maxPreviewHeight, videoHeight);
          previewWidth = (videoWidth * previewHeight) / videoHeight;
        }
        
        try {
          // Create a low-resolution video using MediaRecorder
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = previewWidth;
          canvas.height = previewHeight;
          
          const stream = canvas.captureStream(15); // Reduced to 15 FPS for smaller file size
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8',
            videoBitsPerSecond: 50000 // Very low bitrate for small file size
          });
          
          const chunks: Blob[] = [];
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            const previewBlob = new Blob(chunks, { type: 'video/webm' });
            const preview = URL.createObjectURL(previewBlob);
            
            resolve({
              preview,
              width: videoWidth,
              height: videoHeight,
              error: resolutionError || undefined,
              previewBlob
            });
          };
          
          // Start recording
          mediaRecorder.start();
          
          // Draw video frames to canvas for the FULL duration
          let startTime = Date.now();
          const targetDuration = duration * 1000; // Convert to milliseconds
          
          const drawFrame = () => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed < targetDuration && video.currentTime < duration) {
              ctx?.drawImage(video, 0, 0, previewWidth, previewHeight);
              requestAnimationFrame(drawFrame);
            } else {
              mediaRecorder.stop();
            }
          };
          
          video.currentTime = 0;
          video.play();
          drawFrame();
          
        } catch (error) {
          // Fallback: create a thumbnail image if video recording fails
          video.currentTime = 1; // Capture frame at 1 second
          
          video.onseeked = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = previewWidth;
            canvas.height = previewHeight;
            
            ctx?.drawImage(video, 0, 0, previewWidth, previewHeight);
            const preview = canvas.toDataURL('image/jpeg', 0.6);
            
            resolve({
              preview,
              width: videoWidth,
              height: videoHeight,
              error: resolutionError || undefined
            });
          };
        }
      };
      
      video.onerror = () => {
        resolve({
          preview: '',
          width: 0,
          height: 0,
          error: 'Failed to load video'
        });
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const processFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Check total file count
    if (uploadedFiles.length + fileArray.length > VALIDATION_RULES.maxFiles) {
      alert(`Maximum ${VALIDATION_RULES.maxFiles} files allowed`);
      return;
    }
    
    // Check total session size
    const currentSize = uploadedFiles.reduce((sum, f) => sum + f.file.size, 0);
    const newSize = fileArray.reduce((sum, f) => sum + f.size, 0);
    if (currentSize + newSize > VALIDATION_RULES.maxSessionSize) {
      alert('Total session size exceeds 1GB limit');
      return;
    }
    
    // Create initial file objects with processing state
    const newFiles: UploadedFile[] = fileArray.map(file => {
      const id = Math.random().toString(36).substr(2, 9);
      const validationError = validateFile(file);
      
      return {
        id,
        file,
        preview: '',
        width: 0,
        height: 0,
        error: validationError || undefined,
        isProcessing: !validationError // Only process if no validation error
      };
    });
    
    // Update state with all new files at once
    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
    
    // Process each file that doesn't have validation errors
    for (const newFile of newFiles) {
      if (newFile.error) continue; // Skip files with validation errors
      
      try {
        const isImage = VALIDATION_RULES.supportedImageFormats.includes(newFile.file.type);
        const result = isImage 
          ? await createImagePreview(newFile.file)
          : await createVideoPreview(newFile.file);
        
        // Update the specific file with preview data
        setUploadedFiles(prevFiles => {
          const updatedFiles = prevFiles.map(f => 
            f.id === newFile.id 
              ? {
                  ...f,
                  preview: result.preview,
                  width: result.width,
                  height: result.height,
                  error: result.error,
                  isProcessing: false
                }
              : f
          );
          onFilesChange(updatedFiles);
          return updatedFiles;
        });
      } catch (error) {
        // Update the specific file with error
        setUploadedFiles(prevFiles => {
          const updatedFiles = prevFiles.map(f => 
            f.id === newFile.id 
              ? {
                  ...f,
                  error: 'Failed to process file',
                  isProcessing: false
                }
              : f
          );
          onFilesChange(updatedFiles);
          return updatedFiles;
        });
      }
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== id);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [uploadedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same files again
    e.target.value = '';
  };

  const totalSize = uploadedFiles.reduce((sum, file) => sum + file.file.size, 0);
  const remainingSize = VALIDATION_RULES.maxSessionSize - totalSize;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <section className="bg-white rounded-lg p-8 mb-6">
      <h2 className="text-xl font-semibold mb-6">Browse Files</h2>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-lg mb-2">
          Drag and drop photos & videos here
        </p>
        <p className="text-gray-500 mb-4">or</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Browse Files
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/heic,video/mp4,video/mov"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="mt-6 text-sm text-gray-500 space-y-1">
          <p>Supported formats: JPEG, PNG, HEIC, MP4, MOV</p>
          <p>Maximum session size: 1GB • Min 20 files, Max 150 files • Max 20MB per file</p>
          <p>For optimal quality: Photos minimum 12MP, Videos minimum 1080p resolution</p>
        </div>
      </div>

      {/* File Stats */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium">
            {uploadedFiles.length} Files selected • Total {formatFileSize(totalSize)} • {formatFileSize(remainingSize)} left
          </p>
        </div>
      )}

      {/* File Previews */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {file.isProcessing ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : file.preview ? (
                    file.file.type.startsWith('video/') ? (
                      <video
                        src={file.preview}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                    ) : (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {file.file.type.startsWith('video/') ? (
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded flex items-center justify-center">
                            <span className="text-gray-600 text-xs">VIDEO</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded flex items-center justify-center">
                            <span className="text-gray-600 text-xs">IMG</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Delete button on hover */}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                  
                  {/* Video indicator */}
                  {file.file.type.startsWith('video/') && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      VIDEO
                    </div>
                  )}
                </div>
                
                {/* File info */}
                <div className="mt-2">
                  <p className="text-xs font-medium truncate">{file.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {file.file.type.startsWith('video/') ? 'MP4 movie' : 'JPEG image'} • {formatFileSize(file.file.size)}
                  </p>
                  
                  {/* Error message */}
                  {file.error && (
                    <div className="flex items-center mt-1 text-red-600">
                      <AlertTriangle size={12} className="mr-1" />
                      <p className="text-xs">{file.error}</p>
                    </div>
                  )}
                  
                  {/* Processing indicator */}
                  {file.isProcessing && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-green-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default FileUpload;