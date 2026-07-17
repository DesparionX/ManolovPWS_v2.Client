import { useEffect, useRef, useState, type FocusEvent } from "react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Mars, Venus } from "lucide-react";
import { FloatingInput } from "../../../shared/components/FloatingInput";
import { DatePicker } from "../../../shared/components/DatePicker";
import { ImageUpload } from "../../../shared/components/ImageUpload";
import {
  useUpdateName,
  useUpdateAddress,
  useUpdateEmail,
  useUpdatePhoneNumber,
  useUpdateBirthDate,
  useUpdateGender,
  useUpdateSummary,
  useUpdateProfession,
  useUpdateProfilePicture,
} from "../api/profileMutations";
import type { PrivateUserReadModel } from "../types/profileTypes";

const LATIN_NAME = /^[A-Za-z]+$/;
const NINETY_YEARS_AGO = new Date();
NINETY_YEARS_AGO.setFullYear(NINETY_YEARS_AGO.getFullYear() - 90);

function isValidName(value: string) {
  return LATIN_NAME.test(value) && value.length >= 3 && value.length <= 20;
}

function EditToggleButton({
  editable,
  onToggleEditable,
}: {
  editable: boolean;
  onToggleEditable: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggleEditable}
      className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-primary transition-colors duration-300 hover:border-accent"
    >
      {editable ? "Preview" : "Edit"}
    </button>
  );
}

function AutoGrowTextarea({
  value,
  onChange,
  onBlur,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div>
      <label htmlFor="summary" className="mb-1 block text-sm text-text-secondary">
        Summary
      </label>
      <textarea
        ref={ref}
        id="summary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        rows={3}
        className={`w-full resize-none rounded-lg border bg-bg-base/50 px-3 py-2 text-text-primary transition-colors duration-300 focus:outline-none ${
          error ? "border-danger" : "border-border-default focus:border-accent"
        }`}
      />
      {error && <p className="mt-2 max-w-[92%] text-sm text-danger">{error}</p>}
    </div>
  );
}

interface ProfileMainTabProps {
  profile: PrivateUserReadModel;
  editable: boolean;
  onToggleEditable: () => void;
}

export function ProfileMainTab({
  profile,
  editable,
  onToggleEditable,
}: ProfileMainTabProps) {
  const [name, setName] = useState({
    firstName: profile.firstName,
    middleName: profile.middleName ?? "",
    lastName: profile.lastName,
  });
  const [address, setAddress] = useState({
    country: profile.country ?? "",
    region: profile.region ?? "",
    municipality: profile.municipality ?? "",
    city: profile.city ?? "",
    street: profile.street ?? "",
    postalCode: profile.postalCode ?? "",
  });
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phoneNumber ?? "");
  const [summary, setSummary] = useState(profile.summary ?? "");
  const [profession, setProfession] = useState(profile.profession ?? "");
  const [gender, setGender] = useState(profile.gender.toLowerCase());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateName = useUpdateName();
  const updateAddress = useUpdateAddress();
  const updateEmail = useUpdateEmail();
  const updatePhone = useUpdatePhoneNumber();
  const updateBirthDate = useUpdateBirthDate();
  const updateGender = useUpdateGender();
  const updateSummary = useUpdateSummary();
  const updateProfession = useUpdateProfession();
  const updateProfilePicture = useUpdateProfilePicture();

  function setError(field: string, message: string | null) {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  }

  function handleNameGroupBlur(e: FocusEvent<HTMLDivElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;

    const nextName = { ...name };
    let reverted = false;
    if (nextName.firstName.trim() === "") {
      nextName.firstName = profile.firstName;
      reverted = true;
    }
    if (nextName.lastName.trim() === "") {
      nextName.lastName = profile.lastName;
      reverted = true;
    }

    const validFirst = isValidName(nextName.firstName);
    const validLast = isValidName(nextName.lastName);
    const validMiddle =
      nextName.middleName === "" || isValidName(nextName.middleName);
    setError("firstName", validFirst ? null : "3-20 Latin letters");
    setError("lastName", validLast ? null : "3-20 Latin letters");
    setError("middleName", validMiddle ? null : "3-20 Latin letters");

    if (reverted) {
      setName(nextName);
      return;
    }

    if (!validFirst || !validLast || !validMiddle) return;

    const unchanged =
      nextName.firstName === profile.firstName &&
      nextName.lastName === profile.lastName &&
      nextName.middleName === (profile.middleName ?? "");
    if (unchanged) return;

    updateName.mutate({
      firstName: nextName.firstName,
      lastName: nextName.lastName,
      middleName: nextName.middleName || null,
    });
  }

  function handleAddressGroupBlur(e: FocusEvent<HTMLDivElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;

    const fields = ["country", "region", "municipality", "city", "street"] as const;
    const nextAddress = { ...address };
    let reverted = false;
    for (const field of fields) {
      if (nextAddress[field].trim() === "") {
        nextAddress[field] = profile[field] ?? "";
        reverted = true;
      }
    }
    if (nextAddress.postalCode.trim() === "") {
      nextAddress.postalCode = profile.postalCode ?? "";
      reverted = true;
    }

    let allValid = true;
    for (const field of fields) {
      const valid = nextAddress[field].length >= 2 && nextAddress[field].length <= 100;
      setError(field, valid ? null : "2-100 characters");
      if (!valid) allValid = false;
    }
    const validPostal = /^[0-9-]{2,100}$/.test(nextAddress.postalCode);
    setError("postalCode", validPostal ? null : "Digits and dashes only, 2-100 characters");
    if (!validPostal) allValid = false;

    if (reverted) {
      setAddress(nextAddress);
      return;
    }

    if (!allValid) return;

    const unchanged =
      nextAddress.country === (profile.country ?? "") &&
      nextAddress.region === (profile.region ?? "") &&
      nextAddress.municipality === (profile.municipality ?? "") &&
      nextAddress.city === (profile.city ?? "") &&
      nextAddress.street === (profile.street ?? "") &&
      nextAddress.postalCode === (profile.postalCode ?? "");
    if (unchanged) return;

    updateAddress.mutate(nextAddress);
  }

  function handleEmailBlur() {
    if (email.trim() === "") {
      setEmail(profile.email);
      setError("email", null);
      return;
    }
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 100;
    setError("email", valid ? null : "Invalid email");
    if (!valid) return;
    if (email === profile.email) return;
    updateEmail.mutate({ email });
  }

  function handlePhoneBlur() {
    if (phone === "") {
      setError("phoneNumber", null);
      return;
    }
    const valid = isValidPhoneNumber(phone);
    setError("phoneNumber", valid ? null : "Invalid phone number");
    if (!valid) return;
    if (phone === (profile.phoneNumber ?? "")) return;
    updatePhone.mutate({ phoneNumber: phone });
  }

  function handleSummaryBlur() {
    if (summary.trim() === "") {
      setSummary(profile.summary ?? "");
      setError("summary", null);
      return;
    }
    const valid = summary.length > 0 && summary.length <= 5000;
    setError("summary", valid ? null : "Required, max 5000 characters");
    if (!valid) return;
    if (summary === (profile.summary ?? "")) return;
    updateSummary.mutate({ summary });
  }

  function handleProfessionBlur() {
    if (profession.trim() === "") {
      setProfession(profile.profession ?? "");
      setError("profession", null);
      return;
    }
    const valid = profession.length > 0 && profession.length <= 100;
    setError("profession", valid ? null : "Required, max 100 characters");
    if (!valid) return;
    if (profession === (profile.profession ?? "")) return;
    updateProfession.mutate({ profession });
  }

  function handleGenderToggle() {
    const next = gender === "male" ? "female" : "male";
    setGender(next);
    updateGender.mutate({ gender: next });
  }

  if (!editable) {
    return (
      <div className="relative flex flex-col items-center gap-4 text-center text-text-primary">
        <div className="absolute top-0 left-0">
          <EditToggleButton editable={editable} onToggleEditable={onToggleEditable} />
        </div>
        {profile.profilePictureUrl ? (
          <img
            src={profile.profilePictureUrl}
            alt=""
            className="h-40 w-32 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-40 w-32 items-center justify-center rounded-lg bg-bg-surface text-xs text-text-secondary">
            No photo
          </div>
        )}
        <div>
          <p className="text-lg font-semibold">
            {profile.firstName} {profile.middleName} {profile.lastName}
          </p>
          <p className="text-text-secondary">{profile.profession}</p>
        </div>
        <p className="max-w-md">{profile.summary}</p>
        <dl className="flex w-full max-w-xs flex-col gap-2 text-sm">
          <div><dt className="text-text-secondary">Birth Date</dt><dd>{profile.birthDate}</dd></div>
          <div><dt className="text-text-secondary">Email</dt><dd>{profile.email}</dd></div>
          <div><dt className="text-text-secondary">Phone</dt><dd>{profile.phoneNumber ?? "—"}</dd></div>
          <div><dt className="text-text-secondary">Address</dt><dd>{[profile.street, profile.city, profile.country].filter(Boolean).join(", ") || "—"}</dd></div>
        </dl>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative flex flex-col items-center gap-4">
        <div className="absolute top-0 left-0">
          <EditToggleButton editable={editable} onToggleEditable={onToggleEditable} />
        </div>
        <ImageUpload
          value={profile.profilePictureUrl}
          onChange={(url) => updateProfilePicture.mutate({ profilePictureUrl: url })}
          folder="manolovpws/profile"
          shape="portrait"
        />

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <Mars
              className={`h-6 w-6 transition-colors duration-300 ${
                gender === "male" ? "text-accent" : "text-text-secondary"
              }`}
            />
            <button
              type="button"
              role="switch"
              aria-checked={gender === "female"}
              aria-label="Toggle gender"
              onClick={handleGenderToggle}
              className="relative flex h-7 w-14 shrink-0 items-center rounded-full border border-border-default bg-bg-base/50 transition-colors duration-300"
            >
              <span
                className={`h-5 w-5 rounded-full bg-accent transition-transform duration-300 ease-out ${
                  gender === "female" ? "translate-x-8" : "translate-x-0.5"
                }`}
              />
            </button>
            <Venus
              className={`h-6 w-6 transition-colors duration-300 ${
                gender === "female" ? "text-accent" : "text-text-secondary"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <FloatingInput id="profession" label="Profession" value={profession} error={errors.profession} onChange={(e) => setProfession(e.target.value)} onBlur={handleProfessionBlur} />
        </div>
      </div>

      <div onBlur={handleNameGroupBlur} className="rounded-xl border border-border-default p-4">
        <p className="mb-4 text-sm font-semibold text-text-primary">Name</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FloatingInput id="firstName" label="First Name" value={name.firstName} error={errors.firstName} onChange={(e) => setName({ ...name, firstName: e.target.value })} />
          <FloatingInput id="middleName" label="Middle Name" value={name.middleName} error={errors.middleName} onChange={(e) => setName({ ...name, middleName: e.target.value })} />
          <FloatingInput id="lastName" label="Last Name" value={name.lastName} error={errors.lastName} onChange={(e) => setName({ ...name, lastName: e.target.value })} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-xs">
          <DatePicker
            label="Birth Date"
            value={profile.birthDate}
            onChange={(v) => updateBirthDate.mutate({ birthDate: v })}
            minDate={NINETY_YEARS_AGO}
            maxDate={new Date()}
          />
        </div>
        <div className="w-full max-w-xs">
          <FloatingInput id="email" label="Email" value={email} error={errors.email} onChange={(e) => setEmail(e.target.value)} onBlur={handleEmailBlur} />
        </div>
        <div className="w-full max-w-xs">
          <FloatingInput id="phoneNumber" label="Phone Number" value={phone} error={errors.phoneNumber} onChange={(e) => setPhone(e.target.value)} onBlur={handlePhoneBlur} />
        </div>
      </div>

      <div onBlur={handleAddressGroupBlur} className="rounded-xl border border-border-default p-4">
        <p className="mb-4 text-sm font-semibold text-text-primary">Address</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FloatingInput id="country" label="Country" value={address.country} error={errors.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
          <FloatingInput id="region" label="Region" value={address.region} error={errors.region} onChange={(e) => setAddress({ ...address, region: e.target.value })} />
          <FloatingInput id="municipality" label="Municipality" value={address.municipality} error={errors.municipality} onChange={(e) => setAddress({ ...address, municipality: e.target.value })} />
          <FloatingInput id="city" label="City" value={address.city} error={errors.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
          <FloatingInput id="street" label="Street" value={address.street} error={errors.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
          <FloatingInput id="postalCode" label="Postal Code" value={address.postalCode} error={errors.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
        </div>
      </div>

      <AutoGrowTextarea
        value={summary}
        onChange={setSummary}
        onBlur={handleSummaryBlur}
        error={errors.summary}
      />
    </div>
  );
}
