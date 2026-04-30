import { useCallback, useEffect, useState } from "react";
import client from "../api/client";

function openInNewTab(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

const emptyForm = { title: "", description: "", link: "", type: "other" };

export default function UserDashboard() {
  const [resources, setResources] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    const [res1, res2] = await Promise.all([
      client.get("/user/resources", { authType: "user" }),
      client.get("/user/favorites", { authType: "user" }),
    ]);
    setResources(res1.data);
    setFavorites(res2.data);
  }, []);

  useEffect(() => {
    loadData().catch(() => setMessage("Failed to load user data"));
  }, [loadData]);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await client.put(`/user/resources/${editingId}`, form, { authType: "user" });
        setMessage("Resource updated");
      } else {
        await client.post("/user/resources", form, { authType: "user" });
        setMessage("Resource created");
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch {
      setMessage("Could not save resource");
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this resource?")) return;
    await client.delete(`/user/resources/${id}`, { authType: "user" });
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    await loadData();
  }

  function onEdit(item) {
    setEditingId(item._id);
    setForm({
      title: item.title,
      description: item.description,
      link: item.link,
      type: item.type || "other",
    });
  }

  async function toggleOwnFavorite(resourceId) {
    await client.post(
      "/user/favorites/resource/toggle",
      { resourceId },
      { authType: "user" }
    );
    await loadData();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-ink">My Favorites & Articles</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Apne custom articles/resources banao, edit karo aur favorites list maintain karo.
      </p>
      {message && <p className="mt-3 text-sm text-brand">{message}</p>}

      <section className="mt-6 rounded-xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">{editingId ? "Edit Resource" : "Create Resource"}</h2>
        <form onSubmit={onSubmit} className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="rounded-lg border border-border bg-surface-muted px-3 py-2"
          />
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="rounded-lg border border-border bg-surface-muted px-3 py-2"
          >
            <option value="other">other</option>
            <option value="repo">repo</option>
            <option value="news">news</option>
          </select>
          <input
            required
            placeholder="https://example.com"
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            className="sm:col-span-2 rounded-lg border border-border bg-surface-muted px-3 py-2"
          />
          <textarea
            required
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="sm:col-span-2 rounded-lg border border-border bg-surface-muted px-3 py-2"
          />
          <div className="sm:col-span-2 flex gap-2">
            <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white" type="submit">
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">My Created Resources</h2>
        <ul className="mt-3 space-y-3">
          {resources.length === 0 && <li className="text-sm text-ink-muted">No resources yet.</li>}
          {resources.map((item) => {
            const isFav = favorites.some((f) => f.kind === "userResource" && f.item?._id === item._id);
            return (
              <li key={item._id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-ink">{item.title}</h3>
                  <span className="text-xs text-ink-muted">{item.type}</span>
                </div>
                <p className="mt-1 text-sm text-ink-muted">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openInNewTab(item.link)}
                    className="rounded border border-border px-3 py-1.5 text-sm"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="rounded border border-border px-3 py-1.5 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item._id)}
                    className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleOwnFavorite(item._id)}
                    className="rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-700"
                  >
                    {isFav ? "Unfavorite" : "Add to Favorites"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">My Favorite List</h2>
        <ul className="mt-3 space-y-3">
          {favorites.length === 0 && <li className="text-sm text-ink-muted">No favorites yet.</li>}
          {favorites.map((fav) => (
            <li key={fav._id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-ink">{fav.item?.title || "Untitled"}</h3>
                <span className="text-xs text-ink-muted">{fav.kind === "post" ? "Public Post" : "My Resource"}</span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">{fav.item?.description}</p>
              <button
                type="button"
                onClick={() => openInNewTab(fav.item?.link)}
                className="mt-2 rounded border border-border px-3 py-1.5 text-sm"
              >
                Open
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
