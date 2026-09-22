export type ProjectStatus = "draft" | "published";

export interface Profile {
  id: string;
  name: string;
  display_name: string | null;
  title: string | null;
  bio: string | null;
  profile_image: string | null;
  location: string | null;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  year: string | null;
  role: string | null;
  responsibilities: string | null;
  tools: string[] | null;
  skills: string[] | null;
  cover_image: string | null;
  external_url: string | null;
  external_url_label: string | null;
  is_featured: boolean;
  status: ProjectStatus;
  display_order: number;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  display_order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  display_order: number;
}

export interface SiteSettings {
  id: string;
  phone: string | null;
  email: string | null;
  instagram: string | null;
}
