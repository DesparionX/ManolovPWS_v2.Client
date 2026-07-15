export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    detail: (id: string) => ["posts", id] as const,
  },
  projects: {
    all: ["projects"] as const,
    detail: (id: string) => ["projects", id] as const,
  },
  cv: ["cv"] as const,
  account: {
    me: ["account", "me"] as const,
  },
  users: {
    detail: (id: string) => ["users", id] as const,
  },
};
