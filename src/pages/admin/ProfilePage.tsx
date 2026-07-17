import { useState } from "react";
import { useProfile } from "../../features/profile";
import { ProfileMainTab } from "../../features/profile/components/ProfileMainTab";
import {
  EducationTab,
  ExperienceTab,
  CertificatesTab,
  LanguagesTab,
  SkillsTab,
  ContactsTab,
} from "../../features/profile/components/ProfileArrayTabs";
import {
  useUpdateEducation,
  useUpdateExperience,
  useUpdateCertificates,
  useUpdateLanguages,
  useUpdateSkills,
  useUpdateContacts,
} from "../../features/profile/api/profileMutations";

const TABS = [
  "Main",
  "Education",
  "Experience",
  "Certificates",
  "Languages",
  "Skills",
  "Contacts",
] as const;

type Tab = (typeof TABS)[number];

export function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile();
  const [activeTab, setActiveTab] = useState<Tab>("Main");
  const [editable, setEditable] = useState(false);

  const updateEducation = useUpdateEducation();
  const updateExperience = useUpdateExperience();
  const updateCertificates = useUpdateCertificates();
  const updateLanguages = useUpdateLanguages();
  const updateSkills = useUpdateSkills();
  const updateContacts = useUpdateContacts();

  if (isLoading) {
    return <p className="text-text-secondary">Loading profile...</p>;
  }

  if (isError || !profile) {
    return (
      <p className="text-danger">
        Couldn't load the profile. Try refreshing the page.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-center text-xl font-semibold text-text-primary">
        Profile
      </h1>
      <div className="mb-6 flex items-center gap-2 overflow-x-auto border-b border-border-default pb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
              activeTab === tab
                ? "bg-accent/15 text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Main" && (
        <ProfileMainTab
          profile={profile}
          editable={editable}
          onToggleEditable={() => setEditable((e) => !e)}
        />
      )}
      {activeTab === "Education" && (
        <EducationTab
          items={profile.educationHistory}
          isSaving={updateEducation.isPending}
          onSave={(education) => updateEducation.mutate({ education })}
        />
      )}
      {activeTab === "Experience" && (
        <ExperienceTab
          items={profile.experience}
          isSaving={updateExperience.isPending}
          onSave={(experience) => updateExperience.mutate({ experience })}
        />
      )}
      {activeTab === "Certificates" && (
        <CertificatesTab
          items={profile.certificates}
          isSaving={updateCertificates.isPending}
          onSave={(certificates) => updateCertificates.mutate({ certificates })}
        />
      )}
      {activeTab === "Languages" && (
        <LanguagesTab
          items={profile.languages}
          isSaving={updateLanguages.isPending}
          onSave={(languages) => updateLanguages.mutate({ languages })}
        />
      )}
      {activeTab === "Skills" && (
        <SkillsTab
          items={profile.skills}
          isSaving={updateSkills.isPending}
          onSave={(skills) => updateSkills.mutate({ skills })}
        />
      )}
      {activeTab === "Contacts" && (
        <ContactsTab
          items={profile.contacts}
          isSaving={updateContacts.isPending}
          onSave={(contacts) => updateContacts.mutate({ contacts })}
        />
      )}
    </div>
  );
}
