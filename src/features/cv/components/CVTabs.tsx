import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  UserRound,
  FolderKanban,
  Briefcase,
  GraduationCap,
  Award,
  GitFork,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { PROJECT_STATE_LABELS, PROJECT_STATE_BADGE_CLASSES } from "../../projects";
import type { PublicCVReadModel } from "../types/cvTypes";

function formatDateRange(start: string, end: string | null) {
  const startLabel = format(parseISO(start), "MMM yyyy");
  const endLabel = end ? format(parseISO(end), "MMM yyyy") : "Present";
  return `${startLabel} – ${endLabel}`;
}

interface TabDef {
  key: string;
  icon: LucideIcon;
  header: string;
  content: React.ReactNode;
}

const HEX_POINTS = "14,1 42,1 55,24 42,47 14,47 1,24";

function HexBadge({
  icon: Icon,
  active,
  onClick,
}: {
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-12 w-14 shrink-0 items-center justify-center"
    >
      <svg viewBox="0 0 56 48" className="absolute inset-0 h-full w-full">
        <polygon
          points={HEX_POINTS}
          strokeWidth="1.5"
          className={`stroke-border-default transition-colors duration-300 ${
            active ? "fill-accent/15" : "fill-bg-surface group-hover:fill-accent/15"
          }`}
        />
        <polygon
          points={HEX_POINTS}
          fill="none"
          strokeWidth="1.5"
          className="hex-trace stroke-accent"
        />
      </svg>
      <Icon
        className={`relative h-5 w-5 transition-colors duration-300 ${
          active ? "text-accent" : "text-text-secondary group-hover:text-accent"
        }`}
      />
    </button>
  );
}

export function CVTabs({ cv }: { cv: PublicCVReadModel }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["summary"]));

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const tabs: TabDef[] = [
    {
      key: "summary",
      icon: UserRound,
      header: cv.profession,
      content: (
        <p className="text-sm whitespace-pre-wrap text-text-secondary">
          {cv.summary}
        </p>
      ),
    },
  ];

  if (cv.projects.length > 0) {
    tabs.push({
      key: "projects",
      icon: FolderKanban,
      header: "Projects",
      content: (
        <div className="space-y-5">
          {cv.projects.map((project) => (
            <div key={project.name} className="group">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="font-semibold text-text-primary transition-colors duration-300 group-hover:text-accent">
                  {project.name}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${PROJECT_STATE_BADGE_CLASSES[project.state]}`}
                >
                  {PROJECT_STATE_LABELS[project.state]}
                </span>
              </div>
              <div
                className="text-sm text-text-secondary [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
              {project.stack.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-border-default px-2.5 py-1 text-xs text-text-secondary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {(project.gitHubUrl || project.liveUrl) && (
                <div className="mt-2 flex flex-wrap gap-3">
                  {project.gitHubUrl && (
                    <a
                      href={project.gitHubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm text-text-primary transition-colors duration-300 hover:text-accent"
                    >
                      <GitFork className="h-3.5 w-3.5" /> GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm text-text-primary transition-colors duration-300 hover:text-accent"
                    >
                      <Globe className="h-3.5 w-3.5" /> Live Preview
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ),
    });
  }

  if (cv.workExperience.length > 0) {
    tabs.push({
      key: "employment",
      icon: Briefcase,
      header: "Employment History",
      content: (
        <div className="space-y-5">
          {cv.workExperience.map((job) => (
            <div key={`${job.company}-${job.title}-${job.startDate}`} className="group">
              <p className="font-semibold text-text-primary transition-colors duration-300 group-hover:text-accent">
                {job.title}
              </p>
              <p className="text-sm text-text-secondary">
                {job.company} · {formatDateRange(job.startDate, job.endDate)}
              </p>
              <div
                className="mt-1 text-sm text-text-secondary [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>
          ))}
        </div>
      ),
    });
  }

  if (cv.education.length > 0) {
    tabs.push({
      key: "education",
      icon: GraduationCap,
      header: "Education",
      content: (
        <div className="space-y-5">
          {cv.education.map((edu) => (
            <div key={`${edu.schoolName}-${edu.degree}-${edu.startDate}`} className="group">
              <p className="font-semibold text-text-primary transition-colors duration-300 group-hover:text-accent">
                {edu.degree} · {edu.fieldOfStudy}
              </p>
              <p className="text-sm text-text-secondary">
                {edu.schoolName} ({edu.schoolType}) ·{" "}
                {formatDateRange(edu.startDate, edu.endDate)}
              </p>
            </div>
          ))}
        </div>
      ),
    });
  }

  if (cv.certificates.length > 0) {
    tabs.push({
      key: "certificates",
      icon: Award,
      header: "Certificates",
      content: (
        <div className="space-y-5">
          {cv.certificates.map((cert) => (
            <div key={cert.credentialId}>
              <p className="text-sm">
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-text-primary transition-colors duration-300 hover:text-accent"
                >
                  {cert.title}
                </a>
                <span className="text-text-secondary">
                  {" "}
                  — {cert.issuer} · {format(parseISO(cert.dateObtained), "MMM yyyy")}
                </span>
              </p>
            </div>
          ))}
        </div>
      ),
    });
  }

  return (
    <div className="flex-1">
      {tabs.map((tab, index) => {
        const isOpen = expanded.has(tab.key);
        const isLast = index === tabs.length - 1;
        return (
          <div key={tab.key} className={`relative ${isLast ? "" : "pb-6"}`}>
            {/* Spans from this hexagon's bottom to this wrapper's own
                bottom edge (bottom-0) — which includes any expanded content
                plus the pb-6 gap, so it always reaches exactly to the next
                hexagon's top regardless of expand state, instead of a fixed
                guessed length that fell short once content pushed the next
                tab further down. No line after the last tab. */}
            {!isLast && (
              <div className="absolute top-12 bottom-0 left-7 w-px bg-border-default" />
            )}
            <div className="relative flex w-full items-center gap-4">
              <HexBadge
                icon={tab.icon}
                active={isOpen}
                onClick={() => toggle(tab.key)}
              />
              <span
                className={`text-lg font-semibold transition-colors duration-300 ${
                  isOpen ? "text-accent" : "text-text-secondary"
                }`}
              >
                {tab.header}
              </span>
            </div>
            {/* Content stays mounted at all times — a grid-template-rows
                transition (0fr <-> 1fr) animates its height smoothly without
                needing to know its actual height up front, which a plain
                height/max-height transition can't do for variable content.
                The overflow-hidden inner div clips it to that animated row
                size; pt-3 (not a margin) provides the top spacing so it
                collapses away cleanly to nothing at 0fr instead of leaving
                a stray gap. */}
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="pt-3 ml-18">{tab.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
