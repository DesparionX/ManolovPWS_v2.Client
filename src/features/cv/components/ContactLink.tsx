import type { ContactDto } from "../../profile";
import { NETWORK_ICONS, FALLBACK_NETWORK_ICON } from "../../../shared/utils/networkIcons";

// Icon resolved via the shared react-icons lookup (networkIcons.ts) keyed
// off contact.network — supersedes the earlier public/icons/networks/
// {network}.png + onError approach (see pages/CV.md's Contacts section for
// that history). These are SVG components that inherit currentColor, so
// they pick up this link's own accent hover treatment automatically.
// Icon-only now (network name label removed per Owner feedback) — title/
// aria-label carry the network name for hover/screen-reader discoverability
// instead, since nothing else here names it visually anymore.
export function ContactLink({ contact }: { contact: ContactDto }) {
  const Icon = NETWORK_ICONS[contact.network] ?? FALLBACK_NETWORK_ICON;

  return (
    <a
      href={contact.fullUrl}
      target="_blank"
      rel="noreferrer"
      title={contact.network}
      aria-label={`${contact.network}: ${contact.profileName}`}
      className="text-text-primary transition-colors duration-300 hover:text-accent"
    >
      <Icon className="h-6 w-6" />
    </a>
  );
}
