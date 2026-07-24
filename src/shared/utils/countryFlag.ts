// Country name → ISO 3166-1 alpha-2, covering common cases. Not exhaustive —
// per CV.md, the flag is an optional nice-to-have ("flag optional if easy to
// derive from country"), so an unmapped country name just renders no flag
// rather than needing a full ISO country database/library.
const COUNTRY_TO_ALPHA2: Record<string, string> = {
  bulgaria: "BG",
  romania: "RO",
  greece: "GR",
  serbia: "RS",
  turkey: "TR",
  macedonia: "MK",
  "north macedonia": "MK",
  albania: "AL",
  germany: "DE",
  france: "FR",
  spain: "ES",
  italy: "IT",
  portugal: "PT",
  netherlands: "NL",
  belgium: "BE",
  switzerland: "CH",
  austria: "AT",
  poland: "PL",
  "czech republic": "CZ",
  czechia: "CZ",
  slovakia: "SK",
  hungary: "HU",
  ukraine: "UA",
  russia: "RU",
  sweden: "SE",
  norway: "NO",
  denmark: "DK",
  finland: "FI",
  ireland: "IE",
  "united kingdom": "GB",
  uk: "GB",
  "united states": "US",
  usa: "US",
  canada: "CA",
  mexico: "MX",
  brazil: "BR",
  argentina: "AR",
  china: "CN",
  japan: "JP",
  "south korea": "KR",
  india: "IN",
  australia: "AU",
  "new zealand": "NZ",
  croatia: "HR",
  slovenia: "SI",
  "bosnia and herzegovina": "BA",
  montenegro: "ME",
  moldova: "MD",
  estonia: "EE",
  latvia: "LV",
  lithuania: "LT",
};

export function getCountryAlpha2(country: string): string | null {
  return COUNTRY_TO_ALPHA2[country.trim().toLowerCase()] ?? null;
}

// Not used for the flag rendered next to Address anymore — Windows' default
// emoji font doesn't include flag glyphs, so the two-character regional
// indicator sequence rendered as literal fallback text (e.g. "BG") instead
// of an actual flag. `getCountryAlpha2` + a flagcdn.com <img> is used
// instead (see `features/cv/components/CVSidebar.tsx`), which renders
// consistently everywhere. Kept in case a text-only context wants the emoji.
export function getCountryFlagEmoji(country: string): string | null {
  const alpha2 = getCountryAlpha2(country);
  if (!alpha2) return null;
  return alpha2
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}
