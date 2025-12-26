export interface Banner {
  id: string;
  image: string;
  url: string;
  text?: string;
  priority?: number;
  createdAt?: string;
  isActive?: boolean;
}

export interface BannerFormData {
  image: File | null;
  url: string;
  text: string;
  priority: number;
  isActive: boolean;
}
