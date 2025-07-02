// Existing types...

export interface AuthResponse {
  authToken: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_photo?: {
      url: string;
    };
  };
}

export interface SignUpFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface Photographer {
  id: number;
  first_name: string;
  last_name: string;
  location?: string;
  website?: string;
  instagram?: string;
  stripe_account_id?: string; // Added for Stripe Connect
  profile_photo: {
    url: string;
  };
  sessions?: Session[];
}

export interface Session {
  id: number;
  tag: string;
  location_id: number;
  surfschool_id?: number;
  session_date: string;
  created_at?: string; // Added created_at field for filtering
  start_hour: number;
  end_hour: number;
  photo_price: number;
  video_price: number;
  image_count: number;
  video_count: number;
  cover_images?: Array<{ url: string }>;
  location: {
    id: number;
    name: string;
    region: string;
    country: string;
  };
  surfschool?: {
    id: number;
    name: string;
  };
  photographer: {
    id: number;
    first_name: string;
    last_name: string;
    profile_photo: {
      url: string;
    };
  };
  media?: Media[];
}

export interface Media {
  id: number;
  type: string;
  media_name: string;
  media_size: number;
  natural_width: number;
  natural_height: number;
  preview_url: string;
}

export interface SessionsResponse {
  sessions: Session[];
}

export interface SurfSchool {
  id: number;
  name: string;
  logo: {
    url: string;
  };
  Location_name: string;
  website?: string;
  phone_number?: string;
  instagram?: string;
}

export interface SurfSchoolResponse {
  surfschool: SurfSchool;
  sessions: Session[];
}