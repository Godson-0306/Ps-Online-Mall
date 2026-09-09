import { useEffect } from 'react';

export default function PageMeta({
  title,
  description = "P's Online Mall — premium fashion, beauty, lifestyle, and electronics.",
}) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} · P's Online Mall` : "P's Online Mall";

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    const previousDescription = meta.getAttribute('content');
    meta.setAttribute('content', description);

    return () => {
      document.title = previousTitle;
      if (previousDescription) {
        meta.setAttribute('content', previousDescription);
      }
    };
  }, [title, description]);

  return null;
}
