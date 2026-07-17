import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/httpClient";
import { queryKeys } from "../../../shared/api/queryKeys";
import type {
  UpdateNameRequest,
  UpdateAddressRequest,
  UpdateEmailRequest,
  UpdatePhoneNumberRequest,
  UpdateBirthDateRequest,
  UpdateGenderRequest,
  UpdateSummaryRequest,
  UpdateProfessionRequest,
  UpdateProfilePictureRequest,
  UpdateEducationRequest,
  UpdateExperienceRequest,
  UpdateCertificatesRequest,
  UpdateLanguagesRequest,
  UpdateSkillsRequest,
  UpdateContactsRequest,
} from "../types/profileTypes";

function useProfilePut<TRequest>(path: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TRequest) =>
      apiFetch<void>(path, { method: "PUT", body: JSON.stringify(body) }),
    meta: { successMessage: "Saved" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
    },
  });
}

export function useUpdateName() {
  return useProfilePut<UpdateNameRequest>("/Account/name");
}

export function useUpdateAddress() {
  return useProfilePut<UpdateAddressRequest>("/Account/address");
}

export function useUpdateEmail() {
  return useProfilePut<UpdateEmailRequest>("/Account/email");
}

export function useUpdatePhoneNumber() {
  return useProfilePut<UpdatePhoneNumberRequest>("/Account/phone-number");
}

export function useUpdateBirthDate() {
  return useProfilePut<UpdateBirthDateRequest>("/Account/birth-date");
}

export function useUpdateGender() {
  return useProfilePut<UpdateGenderRequest>("/Account/gender");
}

export function useUpdateSummary() {
  return useProfilePut<UpdateSummaryRequest>("/Account/summary");
}

export function useUpdateProfession() {
  return useProfilePut<UpdateProfessionRequest>("/Account/profession");
}

export function useUpdateProfilePicture() {
  return useProfilePut<UpdateProfilePictureRequest>("/Account/profile-picture");
}

export function useUpdateEducation() {
  return useProfilePut<UpdateEducationRequest>("/Account/education");
}

export function useUpdateExperience() {
  return useProfilePut<UpdateExperienceRequest>("/Account/experience");
}

export function useUpdateCertificates() {
  return useProfilePut<UpdateCertificatesRequest>("/Account/certificates");
}

export function useUpdateLanguages() {
  return useProfilePut<UpdateLanguagesRequest>("/Account/languages");
}

export function useUpdateSkills() {
  return useProfilePut<UpdateSkillsRequest>("/Account/skills");
}

export function useUpdateContacts() {
  return useProfilePut<UpdateContactsRequest>("/Account/contacts");
}
