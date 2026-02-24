import Image from "next/image";

const images = [
  ["https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=800&q=80", "Before"],
  ["https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80", "After"],
  ["https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80", "Before"],
  ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80", "After"]
] as const;

export default function GalleryPage() {
  return (
    <section className="section-shell">
      <h1 className="text-4xl font-bold">Detail Gallery</h1>
      <p className="mt-3 text-white/70">Replace these placeholders with your own client transformations anytime.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {images.map(([src, label], idx) => (
          <div key={`${src}-${idx}`} className="card p-2">
            <Image src={src} alt={`Gallery ${label}`} width={700} height={500} className="h-64 w-full rounded-xl object-cover" />
            <p className="mt-2 text-sm text-white/70">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
