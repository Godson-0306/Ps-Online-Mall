import { X } from 'lucide-react';
import { useState } from 'react';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div className="relative bg-brand-purple text-white">
      <div className="mx-auto flex min-h-10 max-w-7xl items-center justify-center gap-3 px-4 pr-12 text-center text-xs font-medium sm:text-sm">
        <span>Free delivery on orders above ₦75,000. Summer edits now up to 30% off.</span>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => setVisible(false)}
          className="absolute right-4 rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
