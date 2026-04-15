export type SpotCategory = "restaurant" | "coffee" | "hotel" | "other";

export type Spot = {
  id: string;
  name: string;
  category: SpotCategory;
  url?: string;
  address?: string;
  lat: number;
  lng: number;
  tags: string[];
  createdAt: string;
};

export type CreateSpotInput = Omit<Spot, "id" | "createdAt">;

export type UpdateSpotInput = Partial<CreateSpotInput>;
