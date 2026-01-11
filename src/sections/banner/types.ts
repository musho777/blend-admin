export interface Banner {
  id: string;
  image: string;
  url: string;
  text?: string;
  textAm?: string;
  textRu?: string;
  priority?: number;
  createdAt?: string;
  isActive?: boolean;
}

export interface BannerFormData {
  image: File | null;
  url: string;
  text: string;
  textAm: string;
  textRu: string;
  priority: number;
  isActive: boolean;
}
