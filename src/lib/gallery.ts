import { readdir } from "node:fs/promises";
import path from "node:path";

const LOCAL_GALLERY_DIR = path.join(process.cwd(), "public", "gallery");

const FALLBACK_GALLERY = [
  "https://images.unsplash.com/photo-1485463611174-f302f6a5c1c9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80"
];

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export async function getGalleryImages() {
  try {
    const files = await readdir(LOCAL_GALLERY_DIR, { withFileTypes: true });
    const localImages = files
      .filter((file) => file.isFile())
      .map((file) => file.name)
      .filter((fileName) => ALLOWED_EXTENSIONS.has(path.extname(fileName.toLowerCase())))
      .sort((a, b) => a.localeCompare(b))
      .map((fileName) => `/gallery/${fileName}`);

    return localImages.length > 0 ? localImages : FALLBACK_GALLERY;
  } catch {
    return FALLBACK_GALLERY;
  }
}
