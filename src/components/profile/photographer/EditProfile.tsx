import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

interface ProfileData {
  first_name: string;
  last_name: string;
  username: string;
  location: string;
  website: string;
  instagram: string;
  profile_photo?: {
    url: string;
  };
}

const EditProfile: React.FC = () => {
  const { authToken, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    username: '',
    location: '',
    website: '',
    instagram: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/mydetails', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          username: data.username || '',
          location: data.location || '',
          website: data.website || '',
          instagram: data.instagram || '',
          profile_photo: data.profile_photo
        });
        if (data.profile_photo?.url) {
          setPreviewUrl(data.profile_photo.url);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authToken]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const normalizeUrl = (url: string): string => {
    if (!url.trim()) return '';
    
    const trimmedUrl = url.trim();
    
    // If it already has a protocol, return as is
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    
    // If it starts with www. or looks like a domain, add https://
    if (trimmedUrl.startsWith('www.') || trimmedUrl.includes('.')) {
      return `https://${trimmedUrl}`;
    }
    
    // Otherwise return as is (let the user decide)
    return trimmedUrl;
  };

  const normalizeInstagram = (instagram: string): string => {
    if (!instagram.trim()) return '';
    
    const trimmed = instagram.trim();
    
    // Remove @ if present at the beginning
    if (trimmed.startsWith('@')) {
      return trimmed.substring(1);
    }
    
    // If it's a full Instagram URL, extract the username
    if (trimmed.includes('instagram.com/')) {
      const match = trimmed.match(/instagram\.com\/([^\/\?]+)/);
      return match ? match[1] : trimmed;
    }
    
    return trimmed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      // Set username to "none" before submitting
      const updatedProfileData = { ...profileData, username: 'none' };

      // Normalize the data before sending
      const normalizedWebsite = normalizeUrl(updatedProfileData.website);
      const normalizedInstagram = normalizeInstagram(updatedProfileData.instagram);

      // Create FormData for the request
      const formData = new FormData();
      formData.append('first_name', updatedProfileData.first_name);
      formData.append('last_name', updatedProfileData.last_name);
      formData.append('username', updatedProfileData.username); // This will always be "none"
      formData.append('location', updatedProfileData.location);
      formData.append('website', normalizedWebsite);
      formData.append('instagram', normalizedInstagram);
      
      // Always include profile_photo field
      if (selectedFile) {
        // New file selected
        formData.append('profile_photo', selectedFile);
      } else if (profileData.profile_photo?.url) {
        // No new file, but existing photo URL - send the URL to retain current photo
        formData.append('profile_photo', profileData.profile_photo.url);
      } else {
        // No file and no existing photo - send empty string
        formData.append('profile_photo', '');
      }

      // Debug: Log what we're sending
      console.log('=== PROFILE UPDATE DATA ===');
      console.log('Profile Data:', {
        first_name: updatedProfileData.first_name,
        last_name: updatedProfileData.last_name,
        username: updatedProfileData.username,
        location: updatedProfileData.location,
        website: normalizedWebsite,
        instagram: normalizedInstagram,
        hasSelectedFile: !!selectedFile,
        hasExistingPhoto: !!profileData.profile_photo?.url
      });

      // Log FormData entries
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, `File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }
      console.log('=== END PROFILE UPDATE DATA ===');

      const response = await fetch('https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/profileinfo', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`
          // Don't set Content-Type header - let the browser set it for FormData
        },
        body: formData
      });

      // Log the response for debugging
      console.log('=== PROFILE UPDATE RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Response Data:', responseData);
      } catch (jsonError) {
        console.log('Response is not JSON, getting text...');
        const responseText = await response.text();
        console.log('Response Text:', responseText);
        responseData = { message: responseText };
      }
      console.log('=== END PROFILE UPDATE RESPONSE ===');

      if (!response.ok) {
        // Provide more specific error information
        const errorMessage = responseData?.message || 
                           responseData?.error || 
                           `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      setSuccess(true);
      
      // Update the preview URL if we got a new one back
      if (responseData?.profile_photo?.url) {
        setPreviewUrl(responseData.profile_photo.url);
        
        // Update the user context with the new profile photo
        updateUser({
          profile_photo: {
            url: responseData.profile_photo.url
          }
        });
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Edit Profile</h2>
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No photo</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-sm text-primary hover:text-primary-dark"
              >
                Change Photo
              </button>
              <p className="mt-1 text-xs text-gray-500">
                Recommended: Square JPG, PNG. Max 2MB
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Username field - HIDDEN and NOT REQUIRED */}
          <div className="max-w-md hidden">
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g., Lisboa, Portugal"
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              Your city or region where you primarily shoot
            </p>
          </div>

          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="text"
              placeholder="www.your-portfolio.com"
              value={profileData.website}
              onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              Your portfolio or personal website (optional)
            </p>
          </div>

          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700">
              Instagram
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                @
              </span>
              <input
                type="text"
                placeholder="username"
                value={profileData.instagram}
                onChange={(e) => setProfileData({ ...profileData, instagram: e.target.value })}
                className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Your Instagram username (without @)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              Profile updated successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark disabled:bg-primary disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;