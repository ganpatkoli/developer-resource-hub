const NEW_MS = 7 * 24 * 60 * 60 * 1000;

function isNew(createdAt) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < NEW_MS;
}

function truncate(s, n = 160) {
  if (!s) return "";
  if (s.length <= n) return s;
  return s.slice(0, n).trim() + "…";
}

export default function PostCard({ post, onOpenLink, canFavorite = false, isFavorite = false, onToggleFavorite }) {
  const catName = post.category?.name || "—";
  const showNew = isNew(post.createdAt);
  return (
    <article className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {showNew && (
          <span className="inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
            New
          </span>
        )}
        <span
          className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
            post.type === "repo"
              ? "bg-teal-500/15 text-teal-800 dark:text-teal-200"
              : "bg-sky-500/15 text-sky-800 dark:text-sky-200"
          }`}
        >
          {post.type === "repo" ? "Repo" : "News"}
        </span>
        <span className="text-xs text-ink-muted">{catName}</span>
      </div>
      <h2 className="text-lg font-semibold text-ink">{post.title}</h2>
      <p className="mt-1 flex-1 text-sm text-ink-muted">{truncate(post.description)}</p>
      <div className="mt-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => onOpenLink?.(post.link)}
            className="inline-flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
          >
            Open link
          </button>
          {canFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite?.(post.id)}
              className={`inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition sm:w-auto ${
                isFavorite
                  ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200"
                  : "border-border bg-surface-muted text-ink"
              }`}
            >
              {isFavorite ? "Remove Favorite" : "Add Favorite"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
