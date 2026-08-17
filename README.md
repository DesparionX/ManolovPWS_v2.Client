# ManolovPWS v2 — Client

The React frontend for my personal portfolio site — a full rebuild from the ground up, replacing an earlier Angular version with a modern React + TypeScript stack, backed by a custom-built .NET API.

**Live site:** [manolov.netlify.app](https://manolov.netlify.app/)
**Backend repo:** [ManolovPWS_v2](https://github.com/DesparionX/ManolovPWS_v2)

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?logo=reactquery&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## About

This isn't a template-based portfolio — it's a hand-built single-page application with its own admin panel, driven entirely by a REST API I also built from scratch (see the [backend repo](https://github.com/DesparionX/ManolovPWS_v2)). Everything on the live site — posts, projects, CV data, contact messages — is managed through a custom-built admin interface, not hardcoded content or a CMS.

> This repository is for showcase purposes — it documents the frontend behind a live, deployed system rather than serving as a template to run locally.

## Features

**Public-facing:**

- A blog-style post feed, with pinned posts surfaced first
- A projects showcase, grouped by status (Finished / In Development / Frozen / Abandoned)
- An interactive CV page — expandable sections, tech/soft skill breakdown, and clickable contact links
- A contact form with server-side anti-flood protection

**Admin (owner-only, protected):**

- Full CRUD management for posts and projects, including a TipTap-powered rich text editor
- Profile/CV editor with live blur-triggered autosave — no explicit "Save" button on most fields
- An inbox for contact-form submissions, with read/unread tracking
- Image uploads via Cloudinary, entirely client-side (no backend file storage needed)

## Tech Stack

| Category           | Tools                                                         |
| ------------------ | ------------------------------------------------------------- |
| Framework          | React 19, TypeScript, Vite                                    |
| Data fetching      | TanStack Query, a custom fetch client with silent JWT refresh |
| Forms & validation | React Hook Form, Zod                                          |
| Styling            | Tailwind CSS — dark-mode-first, custom theme                  |
| Rich text          | TipTap                                                        |
| Icons              | react-icons                                                   |
| Media              | Cloudinary (unsigned client-side uploads)                     |
| Deployment         | Netlify                                                       |

## Architecture

The codebase is organized feature-first, not type-first:

```
src/
├── app/          # Entry point, router, global providers
├── pages/        # Route-level components (public + admin)
├── features/     # Feature modules — components, hooks, API calls, types, per feature
├── shared/       # Cross-cutting code: API client, layout, UI primitives, notifications
└── assets/
```

A few design decisions worth calling out:

- **Single-user app.** There's exactly one account — mine. No public registration, no multi-user roles. This shaped a lot of the auth design (no login link anywhere in the public UI, for one).
- **Global error/success handling** lives at the data-fetching layer itself (via TanStack Query's cache-level hooks), not scattered per-component — a failed request always surfaces the same way, everywhere.
- **JWT access tokens live in memory only**, refreshed silently via an HttpOnly cookie — never touched by JavaScript, never in `localStorage`.

## Deployment

Deployed on Netlify. The one non-obvious piece of config is the SPA redirect rule in `netlify.toml`, needed so client-side routes (e.g. `/projects/some-id`) don't 404 on a hard refresh:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## License

MIT — see [LICENSE](./LICENSE).

## Author

**Deyvid Manolov** ([@DesparionX](https://github.com/DesparionX))
