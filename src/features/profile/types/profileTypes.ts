export interface EducationDto {
  schoolName: string;
  schoolType: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
}

export interface JobDto {
  title: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string | null;
}

export interface CertificateDto {
  title: string;
  issuer: string;
  dateObtained: string;
  credentialId: string;
  credentialUrl: string;
}

export interface LanguageDto {
  languageName: string;
  readingLevel: string | null;
  writingLevel: string | null;
  speakingLevel: string | null;
  isNative: boolean;
}

// NOTE: openapi.json types `type` as a plain `string`, but pages/cv.md documents
// it as the numeric enum `1 | 2` (Tech/Soft). Going with cv.md's typed enum
// since it's the more specific source for this exact field's meaning — flag/fix
// if real API responses turn out to send something else once this is live-tested.
export type SkillType = 1 | 2;

export interface SkillDto {
  name: string;
  level: number;
  type: SkillType;
  category: string;
}

export interface ContactDto {
  network: string;
  profileName: string;
  fullUrl: string;
}

export interface PrivateUserReadModel {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  country: string | null;
  region: string | null;
  municipality: string | null;
  city: string | null;
  street: string | null;
  postalCode: string | null;
  phoneNumber: string | null;
  summary: string | null;
  profession: string | null;
  profilePictureUrl: string | null;
  birthDate: string;
  gender: string;
  contacts: ContactDto[];
  skills: SkillDto[];
  languages: LanguageDto[];
  experience: JobDto[];
  educationHistory: EducationDto[];
  certificates: CertificateDto[];
}

export interface UpdateNameRequest {
  firstName: string;
  lastName: string;
  middleName: string | null;
}

export interface UpdateAddressRequest {
  country: string;
  region: string;
  municipality: string;
  city: string;
  street: string;
  postalCode: string;
}

export interface UpdateEmailRequest {
  email: string;
}

export interface UpdatePhoneNumberRequest {
  phoneNumber: string;
}

export interface UpdateBirthDateRequest {
  birthDate: string;
}

export interface UpdateGenderRequest {
  gender: string;
}

export interface UpdateSummaryRequest {
  summary: string;
}

export interface UpdateProfessionRequest {
  profession: string;
}

export interface UpdateProfilePictureRequest {
  profilePictureUrl: string;
}

export interface UpdateEducationRequest {
  education: EducationDto[];
}

export interface UpdateExperienceRequest {
  experience: JobDto[];
}

export interface UpdateCertificatesRequest {
  certificates: CertificateDto[];
}

export interface UpdateLanguagesRequest {
  languages: LanguageDto[];
}

export interface UpdateSkillsRequest {
  skills: SkillDto[];
}

export interface UpdateContactsRequest {
  contacts: ContactDto[];
}
