import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FileUpload from './FileUpload';

type SessionType = 'freesurf' | 'surflesson';

interface SurfSchool {
  id: number;
  name: string;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
  error?: string;
  isProcessing?: boolean;
}

interface FormData {
  type: SessionType;
  location?: number;
  surfschool?: number;
  date: string;
  startHour: number;
  endHour: number;
  photoPrice: number;
  videoPrice: number;
}

interface ResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  success: boolean;
  message: string;
}

interface StripeAccountStatus {
  account_id: string;
  charges_enabled: boolean;
  details_submitted: boolean;
  payouts_enabled: boolean;
}

const ResponseModal: React.FC<ResponseModalProps> = ({ isOpen, onClose, success, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-3">
            {success ? (
              <CheckCircle className="text-green-500\" size={24} />
            ) : (
              <XCircle className="text-red-500" size={24} />
            )}
            <h2 className="text-xl font-bold">
              {success ? 'Session Published!' : 'Publication Failed'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700">{message}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const UploadSession: React.FC = () => {
  const { authToken } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    type: 'freesurf',
    date: '',
    startHour: 6,
    endHour: 7,
    photoPrice: 5,
    videoPrice: 5
  });
  const [surfschools, setSurfschools] = useState<SurfSchool[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stripeAccountStatus, setStripeAccountStatus] = useState<StripeAccountStatus | null>(null);
  const [checkingStripeStatus, setCheckingStripeStatus] = useState(true);
  const [responseModal, setResponseModal] = useState<{
    isOpen: boolean;
    success: boolean;
    message: string;
  }>({
    isOpen: false,
    success: false,
    message: ''
  });

  // Check Stripe account status on component mount
  useEffect(() => {
    checkStripeAccountStatus();
  }, []);

  const checkStripeAccountStatus = async () => {
    try {
      setCheckingStripeStatus(true);
      
      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/stripe-status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStripeAccountStatus(data);
        
        // If account is not ready, redirect to onboarding
        if (!data.charges_enabled || !data.details_submitted || !data.payouts_enabled) {
          navigate('/stripe-onboarding');
          return;
        }
      } else if (response.status === 404) {
        // No Stripe account exists, redirect to onboarding
        navigate('/stripe-onboarding');
        return;
      } else {
        throw new Error('Failed to check Stripe account status');
      }
    } catch (err) {
      console.error('Error checking Stripe account status:', err);
      // On error, redirect to onboarding to be safe
      navigate('/stripe-onboarding');
      return;
    } finally {
      setCheckingStripeStatus(false);
    }
  };

  useEffect(() => {
    const fetchSurfschools = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/surfschool');
        
        if (!response.ok) {
          throw new Error('Failed to fetch surf schools');
        }
        
        const data = await response.json();
        setSurfschools(data.map((school: any) => ({
          id: school.id,
          name: school.name
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch surf schools if Stripe account is ready
    if (stripeAccountStatus?.charges_enabled) {
      fetchSurfschools();
    }
  }, [stripeAccountStatus]);

  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  
  const locations = [
    { id: 10, name: 'Praia do CDS' },
    { id: 9, name: 'Praia do Traquínio' },
    { id: 11, name: 'Praia do Marcelino' }
  ];

  const getValidationErrors = (): string[] => {
    const errors: string[] = [];

    // Check if files are uploaded
    if (uploadedFiles.length === 0) {
      errors.push('Please upload at least one file');
    }

    // NEW RULE: Check minimum session requirements
    if (uploadedFiles.length > 0 && uploadedFiles.length < 20) {
      errors.push(`Session must contain at least 20 items (currently ${uploadedFiles.length})`);
    }

    // NEW RULE: Check minimum photo requirements
    const photoCount = uploadedFiles.filter(file => file.file.type.startsWith('image/')).length;
    if (uploadedFiles.length > 0 && photoCount < 4) {
      errors.push(`Session must contain at least 4 photos (currently ${photoCount})`);
    }

    // Check for file errors
    const filesWithErrors = uploadedFiles.filter(file => file.error);
    if (filesWithErrors.length > 0) {
      errors.push(`${filesWithErrors.length} file(s) have validation errors`);
    }

    // Check for processing files
    const processingFiles = uploadedFiles.filter(file => file.isProcessing);
    if (processingFiles.length > 0) {
      errors.push(`${processingFiles.length} file(s) are still processing`);
    }

    // Check form validation
    if (!formData.date) {
      errors.push('Please select a session date');
    }

    if (formData.type === 'freesurf' && !formData.location) {
      errors.push('Please select a location for free surf session');
    }

    if (formData.type === 'surflesson' && !formData.surfschool) {
      errors.push('Please select a surf school for surf lesson session');
    }

    return errors;
  };

  const createCoverImages = async (files: UploadedFile[]): Promise<File[]> => {
    const imageFiles = files.filter(file => file.file.type.startsWith('image/'));
    const coverFiles: File[] = [];
    
    for (let i = 0; i < Math.min(4, imageFiles.length); i++) {
      const file = imageFiles[i];
      
      // Create a smaller version (225px for longest side)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve) => {
        img.onload = () => {
          const { width: originalWidth, height: originalHeight } = img;
          
          let coverWidth, coverHeight;
          if (originalWidth > originalHeight) {
            coverWidth = 225;
            coverHeight = (originalHeight * 225) / originalWidth;
          } else {
            coverHeight = 225;
            coverWidth = (originalWidth * 225) / originalHeight;
          }
          
          canvas.width = coverWidth;
          canvas.height = coverHeight;
          ctx?.drawImage(img, 0, 0, coverWidth, coverHeight);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const coverFile = new File([blob], `cover_${i + 1}.jpg`, { type: 'image/jpeg' });
              coverFiles.push(coverFile);
            }
            resolve(null);
          }, 'image/jpeg', 0.8);
        };
        img.src = URL.createObjectURL(file.file);
      });
    }
    
    return coverFiles;
  };

  const createPreviewFiles = async (files: UploadedFile[]): Promise<File[]> => {
    const previewFiles: File[] = [];
    
    for (const file of files) {
      // Convert preview data URL to blob
      const response = await fetch(file.preview);
      const blob = await response.blob();
      
      // Get original filename without extension
      const originalName = file.file.name.split('.').slice(0, -1).join('.');
      
      // Determine the correct extension based on file type
      let extension: string;
      if (file.file.type.startsWith('video/')) {
        // For videos, maintain the video format
        if (file.file.type.includes('mp4')) {
          extension = 'mp4';
        } else if (file.file.type.includes('mov')) {
          extension = 'mov';
        } else {
          extension = 'mp4'; // Default to mp4 for other video types
        }
      } else {
        // For images, use jpg
        extension = 'jpg';
      }
      
      // Create preview file with "preview_" prefix and correct extension
      const previewFile = new File([blob], `preview_${originalName}.${extension}`, { 
        type: file.file.type.startsWith('video/') ? `video/${extension}` : 'image/jpeg'
      });
      previewFiles.push(previewFile);
    }
    
    return previewFiles;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = getValidationErrors();
    if (validationErrors.length > 0) {
      setResponseModal({
        isOpen: true,
        success: false,
        message: 'Please fix the following issues before publishing: ' + validationErrors.join(', ')
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Prepare form data
      const formDataToSend = new FormData();
      
      // STEP 1: Create all arrays first
      const mediaFiles: File[] = [];
      
      // STEP 2: Populate media array with ALL original files
      uploadedFiles.forEach((uploadedFile) => {
        mediaFiles.push(uploadedFile.file);
      });

      // STEP 3: Create preview files array with ALL previews (with "preview_" prefix and correct extensions)
      const previewFiles = await createPreviewFiles(uploadedFiles);

      // STEP 4: Create cover images array (first 4 images at 225px)
      const coverImages = await createCoverImages(uploadedFiles);

      // STEP 5: Now add ALL arrays to FormData at once
      mediaFiles.forEach(file => {
        formDataToSend.append('media[]', file);
      });

      previewFiles.forEach(file => {
        formDataToSend.append('media_preview[]', file);
      });

      coverImages.forEach(file => {
        formDataToSend.append('cover_images_input[]', file);
      });

      // Add arrays as JSON strings
      const widths = uploadedFiles.map(file => file.width);
      const heights = uploadedFiles.map(file => file.height);
      
      formDataToSend.append('widths', JSON.stringify(widths));
      formDataToSend.append('heights', JSON.stringify(heights));

      // Add session details
      if (formData.type === 'freesurf') {
        formDataToSend.append('location_id', formData.location!.toString());
      } else {
        formDataToSend.append('surfschool_id', formData.surfschool!.toString());
      }

      formDataToSend.append('session_date', formData.date);
      formDataToSend.append('start_hour', `${formData.startHour}:00`);
      formDataToSend.append('end_hour', `${formData.endHour}:00`);
      formDataToSend.append('photo_price', formData.photoPrice.toString());
      formDataToSend.append('video_price', formData.videoPrice.toString());
      formDataToSend.append('tag', formData.type);

      // Count images and videos
      const imageCount = uploadedFiles.filter(file => file.file.type.startsWith('image/')).length;
      const videoCount = uploadedFiles.filter(file => file.file.type.startsWith('video/')).length;
      
      formDataToSend.append('image_count', imageCount.toString());
      formDataToSend.append('video_count', videoCount.toString());

      // Console log all form data for debugging
      console.log('=== FORM DATA BEING SENT ===');
      console.log('Session Details:');
      console.log('- Type:', formData.type);
      console.log('- Date:', formData.date);
      console.log('- Start Hour:', `${formData.startHour}:00`);
      console.log('- End Hour:', `${formData.endHour}:00`);
      console.log('- Photo Price:', formData.photoPrice);
      console.log('- Video Price:', formData.videoPrice);
      console.log('- Image Count:', imageCount);
      console.log('- Video Count:', videoCount);
      
      if (formData.type === 'freesurf') {
        console.log('- Location ID:', formData.location);
      } else {
        console.log('- Surf School ID:', formData.surfschool);
      }
      
      console.log('Arrays Summary:');
      console.log('- Total Files:', uploadedFiles.length);
      console.log('- Media Files Array Length:', mediaFiles.length);
      console.log('- Preview Files Array Length:', previewFiles.length);
      console.log('- Cover Images Array Length:', coverImages.length);
      console.log('- Widths Array:', widths);
      console.log('- Heights Array:', heights);
      
      console.log('Individual File Details:');
      uploadedFiles.forEach((file, index) => {
        console.log(`File ${index + 1}:`, {
          name: file.file.name,
          type: file.file.type,
          size: file.file.size,
          width: file.width,
          height: file.height
        });
      });

      console.log('Preview Files with "preview_" prefix and correct extensions:');
      previewFiles.forEach((file, index) => {
        console.log(`Preview ${index + 1}:`, {
          name: file.name,
          type: file.type,
          size: file.size
        });
      });

      // Log FormData entries
      console.log('FormData entries:');
      for (const [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, `File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }
      console.log('=== END FORM DATA ===');

      // Submit to API
      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formDataToSend
      });

      const responseData = await response.json();
      console.log('=== BACKEND RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response Data:', responseData);
      console.log('=== END BACKEND RESPONSE ===');

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to publish session');
      }

      // Success
      setResponseModal({
        isOpen: true,
        success: true,
        message: 'Your session has been successfully published! Surfers can now discover and purchase your photos and videos.'
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while publishing the session';
      console.error('=== UPLOAD ERROR ===');
      console.error('Error:', err);
      console.error('=== END UPLOAD ERROR ===');
      
      setResponseModal({
        isOpen: true,
        success: false,
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleModalClose = () => {
    setResponseModal({ isOpen: false, success: false, message: '' });
    if (responseModal.success) {
      navigate('/sessions');
    }
  };

  // Show loading while checking Stripe status
  if (checkingStripeStatus) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const validationErrors = getValidationErrors();
  const canPublish = validationErrors.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-8">
          <Link to="/sessions" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Back to Sessions
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Upload Session</h1>
          <p className="text-gray-600 mt-2">Share your surf photography and video and start earning</p>
          
          {/* Stripe Account Status Indicator */}
          {stripeAccountStatus && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Payment account verified</span>
                <span className="text-green-600 text-sm">• Earning 80% per sale</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {/* 1. Session Requirements Section - MOVED TO FIRST */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Session Requirements</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${uploadedFiles.length >= 20 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Minimum 20 items per session (currently {uploadedFiles.length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${uploadedFiles.filter(f => f.file.type.startsWith('image/')).length >= 4 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Minimum 4 photos per session (currently {uploadedFiles.filter(f => f.file.type.startsWith('image/')).length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${uploadedFiles.filter(f => f.error).length === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>All files must pass quality validation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${uploadedFiles.filter(f => f.isProcessing).length === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>All files must finish processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${formData.date ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Session date must be selected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${(formData.type === 'freesurf' && formData.location) || (formData.type === 'surflesson' && formData.surfschool) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Location or surf school must be selected</span>
              </div>
            </div>
          </section>

          {/* 2. File Upload Section - MOVED TO SECOND */}
          <FileUpload onFilesChange={handleFilesChange} />

          {/* 3. Details Section - REMAINS THIRD */}
          <section className="bg-white rounded-lg p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">Details</h2>
            
            {/* Session Type */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="freesurf"
                    checked={formData.type === 'freesurf'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SessionType })}
                    className="mr-2"
                  />
                  Free Surf
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="surflesson"
                    checked={formData.type === 'surflesson'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SessionType })}
                    className="mr-2"
                  />
                  Surf Lesson
                </label>
              </div>
            </div>

            {/* Location or Surf School */}
            <div className="mb-6">
              {formData.type === 'freesurf' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: Number(e.target.value) })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surf School
                  </label>
                  {loading ? (
                    <div className="flex items-center justify-center h-10">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  ) : error ? (
                    <div className="text-red-600 text-sm">{error}</div>
                  ) : (
                    <select
                      value={formData.surfschool || ''}
                      onChange={(e) => setFormData({ ...formData, surfschool: Number(e.target.value) })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select a surf school</option>
                      {surfschools.map(school => (
                        <option key={school.id} value={school.id}>{school.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Hour
                </label>
                <select
                  value={formData.startHour}
                  onChange={(e) => {
                    const newStartHour = Number(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      startHour: newStartHour,
                      endHour: prev.endHour <= newStartHour ? newStartHour + 1 : prev.endHour
                    }));
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {hours.map(hour => (
                    <option key={hour} value={hour}>{hour.toString().padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Hour
                </label>
                <select
                  value={formData.endHour}
                  onChange={(e) => setFormData({ ...formData, endHour: Number(e.target.value) })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {hours
                    .filter(hour => hour > formData.startHour)
                    .map(hour => (
                      <option key={hour} value={hour}>{hour.toString().padStart(2, '0')}:00</option>
                    ))}
                </select>
              </div>
            </div>
          </section>

          {/* 4. Pricing Section - REMAINS FOURTH */}
          <section className="bg-white rounded-lg p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo Price (per photo)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">€</span>
                  <input
                    type="number"
                    min={formData.type === 'freesurf' ? 5 : 3}
                    max={formData.type === 'freesurf' ? 20 : 15}
                    value={formData.photoPrice}
                    onChange={(e) => setFormData({ ...formData, photoPrice: Number(e.target.value) })}
                    className="w-full pl-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Price (per video)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">€</span>
                  <input
                    type="number"
                    min={formData.type === 'freesurf' ? 5 : 3}
                    max={formData.type === 'freesurf' ? 25 : 35}
                    value={formData.videoPrice}
                    onChange={(e) => setFormData({ ...formData, videoPrice: Number(e.target.value) })}
                    className="w-full pl-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-medium mb-2">Please fix the following issues:</h3>
              <ul className="text-red-700 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/sessions"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canPublish || isSubmitting}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                canPublish && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Session'}
            </button>
          </div>
        </form>
      </div>

      {/* Response Modal */}
      <ResponseModal
        isOpen={responseModal.isOpen}
        onClose={handleModalClose}
        success={responseModal.success}
        message={responseModal.message}
      />
    </div>
  );
};

export default UploadSession;