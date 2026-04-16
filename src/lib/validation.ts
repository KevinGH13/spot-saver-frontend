import { SpotCategory, CreateSpotInput, UpdateSpotInput } from "@/types/spot";

const VALID_CATEGORIES: SpotCategory[] = ["restaurant", "coffee", "hotel", "other"];

const LIMITS = {
  name: 200,
  address: 500,
  url: 2000,
  tag: 50,
  tags: 20,
};

type ValidationResult =
  | { ok: true; data: CreateSpotInput }
  | { ok: false; error: string };

type UpdateValidationResult =
  | { ok: true; data: UpdateSpotInput }
  | { ok: false; error: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateFields(body: Record<string, any>, requireAll: boolean): string | null {
  const { name, category, lat, lng, url, address, tags } = body;

  if (requireAll || name !== undefined) {
    if (typeof name !== "string" || !name.trim())
      return "name is required";
    if (name.length > LIMITS.name)
      return `name must be ${LIMITS.name} characters or less`;
  }

  if (requireAll || category !== undefined) {
    if (!VALID_CATEGORIES.includes(category))
      return `category must be one of: ${VALID_CATEGORIES.join(", ")}`;
  }

  if (requireAll || lat !== undefined) {
    if (typeof lat !== "number" || !isFinite(lat) || lat < -90 || lat > 90)
      return "lat must be a finite number between -90 and 90";
  }

  if (requireAll || lng !== undefined) {
    if (typeof lng !== "number" || !isFinite(lng) || lng < -180 || lng > 180)
      return "lng must be a finite number between -180 and 180";
  }

  if (url !== undefined && url !== null && url !== "") {
    try { new URL(url); } catch { return "url must be a valid URL"; }
    if (url.length > LIMITS.url) return `url must be ${LIMITS.url} characters or less`;
  }

  if (address !== undefined && address !== null && address !== "") {
    if (typeof address !== "string") return "address must be a string";
    if (address.length > LIMITS.address)
      return `address must be ${LIMITS.address} characters or less`;
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) return "tags must be an array";
    if (tags.length > LIMITS.tags) return `tags must have ${LIMITS.tags} items or fewer`;
    if (tags.some((t) => typeof t !== "string" || t.length > LIMITS.tag))
      return `each tag must be a string of ${LIMITS.tag} characters or less`;
  }

  return null;
}

export function validateCreate(body: unknown): ValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body))
    return { ok: false, error: "body must be a JSON object" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const b = body as Record<string, any>;
  const error = validateFields(b, true);
  if (error) return { ok: false, error };

  const data: CreateSpotInput = {
    name: b.name.trim(),
    category: b.category,
    lat: b.lat,
    lng: b.lng,
    address: typeof b.address === "string" && b.address.trim() ? b.address.trim() : undefined,
    url: typeof b.url === "string" && b.url.trim() ? b.url.trim() : undefined,
    tags: Array.isArray(b.tags) ? b.tags : [],
  };

  return { ok: true, data };
}

export function validateUpdate(body: unknown): UpdateValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body))
    return { ok: false, error: "body must be a JSON object" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const b = body as Record<string, any>;
  const error = validateFields(b, false);
  if (error) return { ok: false, error };

  // Whitelist — only allow known updatable fields
  const data: UpdateSpotInput = {};
  if (b.name !== undefined)     data.name     = b.name.trim();
  if (b.category !== undefined) data.category = b.category;
  if (b.lat !== undefined)      data.lat      = b.lat;
  if (b.lng !== undefined)      data.lng      = b.lng;
  if (b.address !== undefined)  data.address  = b.address?.trim() || undefined;
  if (b.url !== undefined)      data.url      = b.url?.trim()     || undefined;
  if (b.tags !== undefined)     data.tags     = b.tags;

  return { ok: true, data };
}
