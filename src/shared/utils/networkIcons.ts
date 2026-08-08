import type { IconType } from "react-icons";
import {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaDiscord,
  FaXTwitter,
  FaTelegram,
  FaInstagram,
  FaYoutube,
  FaStackOverflow,
  FaReddit,
  FaGlobe,
  FaLink,
} from "react-icons/fa6";
import { SiGmail } from "react-icons/si";

// Canonical list of Contacts network values — source of truth for both the
// admin Profile Contacts dropdown and the CV page's icon lookup below (see
// pages/admin/PROFILE.md's Network Options table). Curated, not "every
// platform react-icons supports" — extending this later is a small code
// change (new entry here), not something editable at runtime.
export const NETWORK_OPTIONS = [
  "GitHub",
  "LinkedIn",
  "Facebook",
  "Gmail",
  "Discord",
  "X",
  "Telegram",
  "Instagram",
  "YouTube",
  "Stack Overflow",
  "Reddit",
  "Website",
] as const;

// Exported as a plain lookup map (not a getter function) deliberately —
// `const Icon = getNetworkIcon(x)` immediately used as a JSX tag trips
// eslint-plugin-react-hooks's static-components rule ("component created
// during render"), since it can't statically prove a function call returns
// a stable reference. Plain property access on a map doesn't have that
// problem — same pattern already used elsewhere in this codebase (e.g.
// `const Icon = tab.icon` in CVTabs.tsx's HexBadge, `link.icon` in
// Nav.tsx). Callers do `NETWORK_ICONS[network] ?? FALLBACK_NETWORK_ICON`.
export const NETWORK_ICONS: Record<string, IconType> = {
  GitHub: FaGithub,
  LinkedIn: FaLinkedin,
  Facebook: FaFacebook,
  Gmail: SiGmail,
  Discord: FaDiscord,
  X: FaXTwitter,
  Telegram: FaTelegram,
  Instagram: FaInstagram,
  YouTube: FaYoutube,
  "Stack Overflow": FaStackOverflow,
  Reddit: FaReddit,
  Website: FaGlobe,
};

// Fallback for any value outside the curated list — shouldn't happen in
// practice, since Profile's dropdown constrains entry to NETWORK_OPTIONS,
// but ContactDto.network is still a plain string on the wire, not a real
// enum, so this stays defensive rather than assumed.
export const FALLBACK_NETWORK_ICON: IconType = FaLink;
