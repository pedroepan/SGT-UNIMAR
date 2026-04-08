import { useEffect, useState } from "react";
import { Calendar, Camera, Image as ImageIcon, Medal, Trophy, X } from "lucide-react";

const galleryItems = [
  {
    title: "Juegos Universitarios",
    caption: "Ceremonia y ambiente deportivo en la universidad.",
    image: "/JUEGOS-UNIVERSITARIOS-UNIMAR-2018-EL-VALLE-1.jpg",
  },
  {
    title: "Entrega de Medallas",
    caption: "Reconocimiento a los equipos destacados.",
    image: "/2.jpg",
  },
  {
    title: "Apertura del Evento",
    caption: "Inicio oficial de la jornada deportiva.",
    image: "/3.jpg",
  },
  {
    title: "Equipos en Acción",
    caption: "Participación de distintas disciplinas.",
    image: "/1.jpg",
  },
  {
    title: "Momentos del Público",
    caption: "Apoyo y energía en cada partido.",
    image: "/4.jpg",
  },
];

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<(typeof galleryItems)[number] | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
    <div className="space-y-8 pb-4">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Momentos destacados</h2>
            <p className="text-sm text-slate-600">Explora una selección de imágenes de eventos deportivos universitarios.</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm sm:flex">
            <ImageIcon className="h-4 w-4 text-primary" />
            {galleryItems.length} imágenes
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <article
              key={item.title}
              className="group relative aspect-square overflow-hidden rounded-3xl bg-slate-200 shadow-lg"
            >
              <button
                type="button"
                onClick={() => setSelectedImage(item)}
                className="absolute inset-0 z-10 cursor-zoom-in"
                aria-label={`Abrir imagen ${item.title}`}
              />
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-white/80">{item.caption}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
    {selectedImage && (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={selectedImage.title}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 px-4 py-6 backdrop-blur-sm"
        onClick={() => setSelectedImage(null)}
      >
        <div
          className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-slate-900 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            aria-label="Cerrar imagen"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={selectedImage.image}
            alt={selectedImage.title}
            className="max-h-[85vh] w-full object-contain bg-black"
          />
          <div className="border-t border-white/10 bg-slate-900 px-5 py-4 text-white">
            <h3 className="text-lg font-semibold">{selectedImage.title}</h3>
            <p className="mt-1 text-sm text-white/75">{selectedImage.caption}</p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default Gallery;