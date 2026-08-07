// Most-recent-first, shared by the CV page (Projects/Employment/Education/
// Certificates) and the admin Profile array tabs (Employment/Education/
// Certificates) — both need the exact same "sort a copy by a date field,
// descending" logic. Returns a new array; never mutates the input, since
// callers pass data straight from a loaded query/profile object.
export function sortByDateDesc<T>(items: T[], getDate: (item: T) => string): T[] {
  return [...items].sort(
    (a, b) => new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime(),
  );
}
