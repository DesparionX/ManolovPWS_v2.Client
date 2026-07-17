import { ListEditor } from "../../../shared/components/ListEditor";
import { FloatingInput } from "../../../shared/components/FloatingInput";
import { DatePicker } from "../../../shared/components/DatePicker";
import type {
  EducationDto,
  JobDto,
  CertificateDto,
  LanguageDto,
  SkillDto,
  ContactDto,
} from "../types/profileTypes";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

function normalizeCategory(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function notFuture(date: string): boolean {
  return date <= new Date().toISOString().slice(0, 10);
}

function endNotBeforeStart(start: string, end: string | null): boolean {
  if (!end) return true;
  return end >= start;
}

// --- Education ---

const emptyEducation: EducationDto = {
  schoolName: "",
  schoolType: "",
  degree: "",
  fieldOfStudy: "",
  startDate: "",
  endDate: null,
};

function validateEducation(item: EducationDto) {
  return (
    item.schoolName.length > 0 &&
    item.schoolName.length <= 100 &&
    item.schoolType.length > 0 &&
    item.schoolType.length <= 100 &&
    item.degree.length > 0 &&
    item.degree.length <= 30 &&
    item.fieldOfStudy.length > 0 &&
    item.fieldOfStudy.length <= 50 &&
    item.startDate.length > 0 &&
    notFuture(item.startDate) &&
    endNotBeforeStart(item.startDate, item.endDate)
  );
}

export function EducationTab({
  items,
  isSaving,
  onSave,
}: {
  items: EducationDto[];
  isSaving: boolean;
  onSave: (items: EducationDto[]) => void;
}) {
  return (
    <ListEditor
      items={items}
      emptyItem={emptyEducation}
      isSaving={isSaving}
      onSave={onSave}
      validate={validateEducation}
      renderRow={(item) => (
        <p className="truncate text-text-primary">
          {item.schoolName || "New entry"}{" "}
          <span className="text-text-secondary">— {item.schoolType}</span>
        </p>
      )}
      renderForm={(item, onChange) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FloatingInput
            id="schoolName"
            label="School Name"
            value={item.schoolName}
            onChange={(e) => onChange({ ...item, schoolName: e.target.value })}
          />
          <FloatingInput
            id="schoolType"
            label="School Type"
            value={item.schoolType}
            onChange={(e) => onChange({ ...item, schoolType: e.target.value })}
          />
          <FloatingInput
            id="degree"
            label="Degree"
            value={item.degree}
            onChange={(e) => onChange({ ...item, degree: e.target.value })}
          />
          <FloatingInput
            id="fieldOfStudy"
            label="Field of Study"
            value={item.fieldOfStudy}
            onChange={(e) => onChange({ ...item, fieldOfStudy: e.target.value })}
          />
          <DatePicker
            label="Start Date"
            value={item.startDate || null}
            onChange={(v) => onChange({ ...item, startDate: v })}
            maxDate={new Date()}
          />
          <DatePicker
            label="End Date (leave empty if ongoing)"
            value={item.endDate}
            onChange={(v) => onChange({ ...item, endDate: v })}
          />
        </div>
      )}
    />
  );
}

// --- Experience ---

const emptyExperience: JobDto = {
  title: "",
  company: "",
  description: "",
  startDate: "",
  endDate: null,
};

function validateExperience(item: JobDto) {
  return (
    item.title.length > 0 &&
    item.title.length <= 50 &&
    item.company.length > 0 &&
    item.company.length <= 50 &&
    item.description.length > 0 &&
    item.description.length <= 10000 &&
    item.startDate.length > 0 &&
    notFuture(item.startDate) &&
    endNotBeforeStart(item.startDate, item.endDate)
  );
}

export function ExperienceTab({
  items,
  isSaving,
  onSave,
}: {
  items: JobDto[];
  isSaving: boolean;
  onSave: (items: JobDto[]) => void;
}) {
  return (
    <ListEditor
      items={items}
      emptyItem={emptyExperience}
      isSaving={isSaving}
      onSave={onSave}
      validate={validateExperience}
      renderRow={(item) => (
        <p className="truncate text-text-primary">
          {item.title || "New entry"}{" "}
          <span className="text-text-secondary">— {item.company}</span>
        </p>
      )}
      renderForm={(item, onChange) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FloatingInput
            id="title"
            label="Position"
            value={item.title}
            onChange={(e) => onChange({ ...item, title: e.target.value })}
          />
          <FloatingInput
            id="company"
            label="Company"
            value={item.company}
            onChange={(e) => onChange({ ...item, company: e.target.value })}
          />
          <div className="md:col-span-2">
            <FloatingInput
              id="description"
              label="Description"
              value={item.description}
              onChange={(e) => onChange({ ...item, description: e.target.value })}
            />
          </div>
          <DatePicker
            label="Start Date"
            value={item.startDate || null}
            onChange={(v) => onChange({ ...item, startDate: v })}
            maxDate={new Date()}
          />
          <DatePicker
            label="End Date (leave empty if ongoing)"
            value={item.endDate}
            onChange={(v) => onChange({ ...item, endDate: v })}
          />
        </div>
      )}
    />
  );
}

// --- Certificates ---

const emptyCertificate: CertificateDto = {
  title: "",
  issuer: "",
  dateObtained: "",
  credentialId: "",
  credentialUrl: "",
};

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateCertificate(item: CertificateDto) {
  return (
    item.title.length > 0 &&
    item.title.length <= 100 &&
    item.issuer.length > 0 &&
    item.issuer.length <= 50 &&
    item.dateObtained.length > 0 &&
    notFuture(item.dateObtained) &&
    item.credentialId.length > 0 &&
    item.credentialId.length <= 5000 &&
    isValidUrl(item.credentialUrl)
  );
}

export function CertificatesTab({
  items,
  isSaving,
  onSave,
}: {
  items: CertificateDto[];
  isSaving: boolean;
  onSave: (items: CertificateDto[]) => void;
}) {
  return (
    <ListEditor
      items={items}
      emptyItem={emptyCertificate}
      isSaving={isSaving}
      onSave={onSave}
      validate={validateCertificate}
      renderRow={(item) => (
        <p className="truncate text-text-primary">{item.title || "New entry"}</p>
      )}
      renderForm={(item, onChange) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FloatingInput
            id="certTitle"
            label="Title"
            value={item.title}
            onChange={(e) => onChange({ ...item, title: e.target.value })}
          />
          <FloatingInput
            id="issuer"
            label="Issuer"
            value={item.issuer}
            onChange={(e) => onChange({ ...item, issuer: e.target.value })}
          />
          <DatePicker
            label="Date Obtained"
            value={item.dateObtained || null}
            onChange={(v) => onChange({ ...item, dateObtained: v })}
            maxDate={new Date()}
          />
          <FloatingInput
            id="credentialId"
            label="Credential ID"
            value={item.credentialId}
            onChange={(e) => onChange({ ...item, credentialId: e.target.value })}
          />
          <div className="md:col-span-2">
            <FloatingInput
              id="credentialUrl"
              label="Credential URL"
              value={item.credentialUrl}
              onChange={(e) => onChange({ ...item, credentialUrl: e.target.value })}
            />
          </div>
        </div>
      )}
    />
  );
}

// --- Languages ---

const emptyLanguage: LanguageDto = {
  languageName: "",
  readingLevel: null,
  writingLevel: null,
  speakingLevel: null,
  isNative: false,
};

function validateLanguage(item: LanguageDto) {
  if (item.languageName.length === 0) return false;
  if (item.isNative) return true;
  return Boolean(item.readingLevel && item.writingLevel && item.speakingLevel);
}

export function LanguagesTab({
  items,
  isSaving,
  onSave,
}: {
  items: LanguageDto[];
  isSaving: boolean;
  onSave: (items: LanguageDto[]) => void;
}) {
  return (
    <ListEditor
      items={items}
      emptyItem={emptyLanguage}
      isSaving={isSaving}
      onSave={onSave}
      validate={validateLanguage}
      renderRow={(item) => (
        <p className="truncate text-text-primary">
          {item.languageName || "New entry"}{" "}
          <span className="text-text-secondary">
            — {item.isNative ? "Native" : "Other"}
          </span>
        </p>
      )}
      renderForm={(item, onChange) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FloatingInput
            id="languageName"
            label="Language"
            value={item.languageName}
            onChange={(e) => onChange({ ...item, languageName: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={item.isNative}
              onChange={(e) =>
                onChange({
                  ...item,
                  isNative: e.target.checked,
                  readingLevel: e.target.checked ? null : item.readingLevel,
                  writingLevel: e.target.checked ? null : item.writingLevel,
                  speakingLevel: e.target.checked ? null : item.speakingLevel,
                })
              }
              className="h-4 w-4 accent-accent"
            />
            Native language
          </label>
          {!item.isNative && (
            <>
              <select
                value={item.readingLevel ?? ""}
                onChange={(e) => onChange({ ...item, readingLevel: e.target.value })}
                className="rounded-lg border border-border-default bg-bg-base/50 px-3 py-2 text-text-primary"
              >
                <option value="">Reading level</option>
                {CEFR_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <select
                value={item.writingLevel ?? ""}
                onChange={(e) => onChange({ ...item, writingLevel: e.target.value })}
                className="rounded-lg border border-border-default bg-bg-base/50 px-3 py-2 text-text-primary"
              >
                <option value="">Writing level</option>
                {CEFR_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <select
                value={item.speakingLevel ?? ""}
                onChange={(e) => onChange({ ...item, speakingLevel: e.target.value })}
                className="rounded-lg border border-border-default bg-bg-base/50 px-3 py-2 text-text-primary"
              >
                <option value="">Speaking level</option>
                {CEFR_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </>
          )}
        </div>
      )}
    />
  );
}

// --- Skills ---

const emptySkill: SkillDto = { name: "", level: 1, type: 2, category: "" };

function validateSkill(item: SkillDto) {
  return (
    item.name.length > 0 &&
    item.name.length <= 50 &&
    item.category.trim().length > 0 &&
    item.level >= 1 &&
    item.level <= 10
  );
}

export function SkillsTab({
  items,
  isSaving,
  onSave,
}: {
  items: SkillDto[];
  isSaving: boolean;
  onSave: (items: SkillDto[]) => void;
}) {
  return (
    <ListEditor
      items={items}
      emptyItem={emptySkill}
      isSaving={isSaving}
      onSave={(next) =>
        onSave(next.map((s) => ({ ...s, category: normalizeCategory(s.category) })))
      }
      validate={validateSkill}
      renderRow={(item) => (
        <p className="truncate text-text-primary">
          {item.name || "New entry"}{" "}
          <span className="text-text-secondary">
            — {item.type === 1 ? "Tech" : "Soft"} · {item.category}
          </span>
        </p>
      )}
      renderForm={(item, onChange) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FloatingInput
            id="skillName"
            label="Name"
            value={item.name}
            onChange={(e) => onChange({ ...item, name: e.target.value })}
          />
          <div className="flex overflow-hidden rounded-lg border border-border-default">
            <button
              type="button"
              onClick={() => onChange({ ...item, type: 1 })}
              className={`flex-1 py-2 text-sm transition-colors duration-300 ${
                item.type === 1 ? "bg-accent text-bg-base" : "text-text-secondary"
              }`}
            >
              Tech
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...item, type: 2 })}
              className={`flex-1 py-2 text-sm transition-colors duration-300 ${
                item.type === 2 ? "bg-accent text-bg-base" : "text-text-secondary"
              }`}
            >
              Soft
            </button>
          </div>
          <FloatingInput
            id="category"
            label="Category"
            value={item.category}
            onChange={(e) => onChange({ ...item, category: e.target.value })}
          />
          <FloatingInput
            id="level"
            label="Level (1-10)"
            type="number"
            min={1}
            max={10}
            value={item.level}
            onChange={(e) => onChange({ ...item, level: Number(e.target.value) })}
          />
        </div>
      )}
    />
  );
}

// --- Contacts ---

const emptyContact: ContactDto = { network: "", profileName: "", fullUrl: "" };

function validateContact(item: ContactDto) {
  return (
    item.network.length > 0 &&
    item.network.length <= 30 &&
    item.profileName.length > 0 &&
    item.profileName.length <= 30 &&
    isValidUrl(item.fullUrl)
  );
}

export function ContactsTab({
  items,
  isSaving,
  onSave,
}: {
  items: ContactDto[];
  isSaving: boolean;
  onSave: (items: ContactDto[]) => void;
}) {
  return (
    <ListEditor
      items={items}
      emptyItem={emptyContact}
      isSaving={isSaving}
      onSave={onSave}
      validate={validateContact}
      renderRow={(item) => (
        <p className="truncate text-text-primary">
          {item.network || "New entry"}{" "}
          <span className="text-text-secondary">— {item.profileName}</span>
        </p>
      )}
      renderForm={(item, onChange) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FloatingInput
            id="network"
            label="Network"
            value={item.network}
            onChange={(e) => onChange({ ...item, network: e.target.value })}
          />
          <FloatingInput
            id="profileName"
            label="Profile Name"
            value={item.profileName}
            onChange={(e) => onChange({ ...item, profileName: e.target.value })}
          />
          <div className="md:col-span-2">
            <FloatingInput
              id="fullUrl"
              label="Full URL"
              value={item.fullUrl}
              onChange={(e) => onChange({ ...item, fullUrl: e.target.value })}
            />
          </div>
        </div>
      )}
    />
  );
}
