import type { ProjectState } from "../../projects";
import type {
  JobDto,
  EducationDto,
  CertificateDto,
  SkillDto,
  LanguageDto,
  ContactDto,
} from "../../profile";

export interface PublicAddress {
  country: string;
  city: string;
}

export interface CVProjectReadModel {
  name: string;
  description: string;
  state: ProjectState;
  liveUrl: string | null;
  gitHubUrl: string | null;
  stack: string[];
}

export interface PublicCVReadModel {
  profilePictureUrl: string | null;
  fullName: string;
  gender: string;
  address: PublicAddress | null;
  profession: string;
  summary: string;
  workExperience: JobDto[];
  projects: CVProjectReadModel[];
  education: EducationDto[];
  certificates: CertificateDto[];
  skills: SkillDto[];
  languages: LanguageDto[];
  contacts: ContactDto[];
}
