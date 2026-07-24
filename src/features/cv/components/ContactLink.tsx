import { useState } from "react";
import { Link as LinkIcon } from "lucide-react";
import type { ContactDto } from "../../profile";

// Per-network icons aren't in the repo yet (no assets/icons/networks/ folder,
// and lucide-react's installed version has no brand/network icons at all) —
// falls back to a generic link icon via onError. Once real
// `public/icons/networks/{network}.png` files are added, they'll just start
// rendering automatically, no code change needed.
export function ContactLink({ contact }: { contact: ContactDto }) {
  const [iconFailed, setIconFailed] = useState(false);
  const iconSrc = `/icons/networks/${contact.network.toLowerCase()}.png`;

  return (
    <a
      href={contact.fullUrl}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 text-text-primary transition-colors duration-300 hover:text-accent"
    >
      {iconFailed ? (
        <LinkIcon className="h-4 w-4 shrink-0 text-text-secondary" />
      ) : (
        <img
          src={iconSrc}
          alt=""
          className="h-4 w-4 shrink-0 object-contain"
          onError={() => setIconFailed(true)}
        />
      )}
      <span className="truncate text-sm">{contact.profileName}</span>
    </a>
  );
}
