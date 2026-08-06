import { Home, FolderKanban, FileText, Mail } from "lucide-react";

export const NAV_LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/cv", label: "CV", icon: FileText },
  { to: "/contact", label: "Contact", icon: Mail },
];
