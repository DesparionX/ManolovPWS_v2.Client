import { ContactLink } from "./ContactLink";
import { SkillsSection } from "./SkillsSection";
import { LanguagesSection } from "./LanguagesSection";
import { getCountryAlpha2 } from "../../../shared/utils/countryFlag";
import type { PublicCVReadModel } from "../types/cvTypes";

export function CVSidebar({ cv }: { cv: PublicCVReadModel }) {
  const alpha2 = cv.address ? getCountryAlpha2(cv.address.country) : null;

  return (
    <div className="flex w-full flex-col items-center gap-8 text-center md:w-72 md:shrink-0">
      {cv.address && (
        <div>
          <h2 className="mb-2 text-sm font-semibold tracking-wide text-accent uppercase">
            Address
          </h2>
          <p className="flex items-center justify-center gap-1.5 text-sm text-text-secondary">
            <span>
              {cv.address.city}, {cv.address.country}
            </span>
            {alpha2 && (
              <img
                src={`https://flagcdn.com/24x18/${alpha2.toLowerCase()}.png`}
                alt={cv.address.country}
                className="h-3.25 w-4.5 rounded-xs object-cover"
              />
            )}
          </p>
        </div>
      )}

      {cv.contacts.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold tracking-wide text-accent uppercase">
            Contacts
          </h2>
          <div className="flex flex-col items-center gap-2">
            {cv.contacts.map((contact) => (
              <ContactLink key={contact.network + contact.profileName} contact={contact} />
            ))}
          </div>
        </div>
      )}

      <SkillsSection skills={cv.skills} />

      <LanguagesSection languages={cv.languages} />
    </div>
  );
}
