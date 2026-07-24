import { Mars, Venus, UserRound } from "lucide-react";
import type { PublicCVReadModel } from "../types/cvTypes";

export function CVHeader({ cv }: { cv: PublicCVReadModel }) {
  const isFemale = cv.gender.toLowerCase() === "female";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-lg bg-linear-to-br from-accent to-accent-dark p-1.5">
        <div className="h-44 w-36 overflow-hidden rounded-md">
          {cv.profilePictureUrl ? (
            <img
              src={cv.profilePictureUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bg-surface">
              <UserRound className="h-12 w-12 text-text-secondary" />
            </div>
          )}
        </div>
      </div>
      <p className="flex items-center gap-2 text-xl font-semibold text-text-primary">
        {cv.fullName}
        {isFemale ? (
          <Venus className="h-5 w-5 text-accent" aria-label="Female" />
        ) : (
          <Mars className="h-5 w-5 text-accent" aria-label="Male" />
        )}
      </p>
    </div>
  );
}
