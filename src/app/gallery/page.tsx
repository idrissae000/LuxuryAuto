import Image from "next/image";
import { getGalleryImages } from "@/lib/gallery";

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <section className="section-shell">
      <h1 className="text-4xl font-bold">Detail Gallery</h1>
      <p className="mt-3 text-white/70">Add your own photos to <code>public/gallery/</code> and they will appear here automatically.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {images.map((src, idx) => (
          <div key={`${src}-${idx}`} className="card p-2">
            <Image src={src} alt={`Gallery image ${idx + 1}`} width={700} height={500} className="h-64 w-full rounded-xl object-cover" />
            <p className="mt-2 text-sm text-white/70">Client transformation #{idx + 1}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
