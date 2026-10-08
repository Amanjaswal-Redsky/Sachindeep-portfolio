import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  getAdminSession,
  loginAdmin,
  logoutAdmin,
} from "../../data/projectsApi";
import { deleteProject, fetchAllProjects, saveProject, uploadProjectImage } from "../../data/supabasePortfolio";
import { supabase } from "../../lib/supabase";
import "./Admin.css";

const bundledImages = Object.values(import.meta.glob(
  "../../assets/*.{png,jpg,jpeg,webp}",
  { eager: true, query: "?url", import: "default" },
));

const emptyProject = {
  type: "web",
  title: "",
  description: "",
  category: "",
  technology: "",
  image_url: "",
  project_url: "",
  github_url: "",
};

function friendlyError(error) {
  if (error.status === 401) return "Your session expired. Please sign in again.";
  return error.message || "Something went wrong. Please try again.";
}

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("sachindeep.redsky@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      try {
        const { session } = await getAdminSession();
        if (active && session) {
          navigate("/admin/dashboard", { replace: true });
        }
      } catch {
        // no active Supabase session; remain on login screen
      }
    };

    restoreSession();
    return () => { active = false; };
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { session } = await loginAdmin(email, password);

      if (!session) {
        throw new Error("Supabase session was not created.");
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-shell admin-login-shell">
      <div className="admin-login-glow" />
      <a className="admin-back-link" href="/home"><ArrowLeft size={15} /> Portfolio</a>
      <section className="admin-login-panel">
        <div className="admin-brand-mark">S</div>
        <p className="admin-eyebrow">SECURE ACCESS / 01</p>
        <h1>Admin login</h1>
        <p className="admin-login-copy">Sign in to manage your selected work.</p>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <p className="admin-form-error" role="alert">{error}</p>}
          <button className="admin-primary-button admin-login-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
      <span className="admin-login-footnote">CODENEX / PRIVATE WORKSPACE</span>
    </main>
  );
}

function ProjectCard({ project, onEdit, onDelete }) {
  return (
    <article className="admin-project-card">
      <div className="admin-project-image-wrap">
        <img
          src={project.image_url}
          alt={project.title}
          loading="lazy"
          onError={(event) => {
            if (event.currentTarget.dataset.fallback) {
              event.currentTarget.style.visibility = "hidden";
              return;
            }
            event.currentTarget.dataset.fallback = "true";
            event.currentTarget.src = bundledImages[0];
          }}
        />
      </div>
      <div className="admin-project-content">
        <div className="admin-project-meta">
          <span>{project.type === "web" ? "WEB APPLICATION" : "MOBILE APPLICATION"}</span>
          <span>{project.category}</span>
        </div>
        <h3>{project.title}</h3>
        <p className="admin-project-tech">{project.technology}</p>
        <p className="admin-project-description">{project.description}</p>
        <div className="admin-card-actions">
          <button type="button" className="admin-secondary-button" onClick={() => onEdit(project)}>
            <Pencil size={14} /> Edit
          </button>
          <button type="button" className="admin-danger-button" onClick={() => onDelete(project)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function ProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState(project || emptyProject);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(project?.image_url || "");
  const previewUrl = useRef(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleImageFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]).has(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Choose a PNG, JPG, WEBP, or GIF image up to 5 MB.");
      event.target.value = "";
      return;
    }
    setError("");
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = URL.createObjectURL(file);
    setPreview(previewUrl.current);
    setImageFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!imageFile && !form.image_url) {
      setError("Choose a project image before saving.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let image_url = form.image_url;
      if (imageFile) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("The selected image could not be read."));
          reader.readAsDataURL(imageFile);
        });
        image_url = await uploadProjectImage(dataUrl);
      }
      await onSave({ ...form, image_url }, project?.id);
    } catch (saveError) {
      setError(friendlyError(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-project-modal-title">
        <header className="admin-modal-header">
          <div>
            <p className="admin-eyebrow">PROJECT MANAGEMENT</p>
            <h2 id="admin-project-modal-title">{project ? "Edit project" : "Add project"}</h2>
          </div>
          <button type="button" className="admin-icon-button" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        </header>
        <form className="admin-form admin-project-form" onSubmit={handleSubmit}>
          <label>
            Project type
            <select value={form.type} onChange={(event) => updateField("type", event.target.value)}>
              <option value="web">Web project</option>
              <option value="mobile">Mobile project</option>
            </select>
          </label>
          <label>
            Project title
            <input required maxLength={120} value={form.title} onChange={(event) => updateField("title", event.target.value)} />
          </label>
          <label>
            Project description
            <textarea required rows={4} maxLength={2000} value={form.description} onChange={(event) => updateField("description", event.target.value)} />
          </label>
          <div className="admin-form-row">
            <label>
              Technology
              <input required maxLength={160} value={form.technology} onChange={(event) => updateField("technology", event.target.value)} />
            </label>
            <label>
              Category
              <input required maxLength={100} value={form.category} onChange={(event) => updateField("category", event.target.value)} />
            </label>
          </div>
          <label className="admin-upload-field">
            Project image {project ? <span className="admin-optional">Choose a new file to replace it</span> : null}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" required={!project && !imageFile} onChange={handleImageFile} />
            <small>Images are saved to Supabase Storage and remain available after refresh. PNG, JPG, WEBP, or GIF up to 5 MB.</small>
          </label>
          {preview && (
            <div className="admin-image-preview">
              <img src={preview} alt="Project preview" />
              <span>IMAGE PREVIEW</span>
            </div>
          )}
          <div className="admin-form-row">
            <label>
              Project link <span className="admin-optional">Optional</span>
              <input type="url" placeholder="https://" value={form.project_url || ""} onChange={(event) => updateField("project_url", event.target.value)} />
            </label>
            <label>
              GitHub link <span className="admin-optional">Optional</span>
              <input type="url" placeholder="https://github.com/..." value={form.github_url || ""} onChange={(event) => updateField("github_url", event.target.value)} />
            </label>
          </div>
          {error && <p className="admin-form-error" role="alert">{error}</p>}
          <div className="admin-modal-actions">
            <button type="button" className="admin-secondary-button" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="admin-primary-button" disabled={saving}>{saving ? "Saving..." : project ? "Save changes" : "Add project"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DeleteConfirmation({ project, onClose, onConfirm, loading, error }) {
  return (
    <div className="admin-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="admin-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-project-title">
        <p className="admin-eyebrow">REMOVE PROJECT</p>
        <h2 id="delete-project-title">Delete {project.title}?</h2>
        <p>Are you sure you want to delete this project?</p>
        {error && <p className="admin-form-error" role="alert">{error}</p>}
        <div className="admin-modal-actions">
          <button type="button" className="admin-secondary-button" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="admin-danger-button" onClick={onConfirm} disabled={loading}>{loading ? "Deleting..." : "Delete"}</button>
        </div>
      </section>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalProject, setModalProject] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    const loadDashboard = async () => {
      try {
        const { session } = await getAdminSession();

        if (!session) {
          navigate("/admin", { replace: true });
          return;
        }

        const savedProjects = await fetchAllProjects();
        if (active) setProjects(savedProjects);
      } catch (loadError) {
        if (!active) return;
        if (loadError.status === 401 || loadError.message?.includes("session")) {
          navigate("/admin", { replace: true });
          return;
        }
        setError("Projects could not be loaded. Check the server connection and retry.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && active) {
        navigate("/admin", { replace: true });
      }
    });

    unsubscribe = data.subscription.unsubscribe;

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigate]);

  const handleSave = async (project, id) => {
    setSaving(true);
    setError("");
    try {
      const savedProject = await saveProject({
        ...project,
        sort_order: project.sort_order ?? projects.length + 1,
      }, id);
      setProjects((current) => id
        ? current.map((item) => item.id === id ? savedProject : item)
        : [...current, savedProject]);
      setModalProject(null);
      setIsAdding(false);
    } catch (saveError) {
      setError(friendlyError(saveError));
      throw saveError;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setDeleteError("");
    try {
      await deleteProject(deletingProject.id, deletingProject.image_url);
      setProjects((current) => current.filter(({ id }) => id !== deletingProject.id));
      setDeletingProject(null);
    } catch (deleteError) {
      setDeleteError(friendlyError(deleteError));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
    }
    navigate("/admin", { replace: true });
  };

  const projectGroups = [
    { type: "web", title: "Web projects" },
    { type: "mobile", title: "Mobile projects" },
  ];

  return (
    <main className="admin-shell admin-dashboard-shell">
      <header className="admin-dashboard-header">
        <a className="admin-dashboard-brand" href="/home"><span className="admin-brand-mark">S</span><span>CODENEX / ADMIN</span></a>
        <div className="admin-header-actions">
          <a className="admin-portfolio-link" href="/home">View portfolio <ArrowLeft size={14} /></a>
          <button type="button" className="admin-secondary-button" onClick={handleLogout}><LogOut size={15} /> Logout</button>
        </div>
      </header>

      <div className="admin-dashboard-content">
        <div className="admin-page-title-row">
          <div>
            <p className="admin-eyebrow">CONTENT / PROJECTS</p>
            <h1>Project dashboard</h1>
            <p className="admin-dashboard-intro">Manage the work displayed on your portfolio.</p>
          </div>
          <button type="button" className="admin-primary-button" onClick={() => setIsAdding(true)}><Plus size={17} /> Add project</button>
        </div>

        {error && <p className="admin-banner-error" role="alert">{error}</p>}

        {loading ? (
          <div className="admin-loading-grid" aria-label="Loading projects">
            {[1, 2, 3].map((item) => <div className="admin-skeleton-card" key={item} />)}
          </div>
        ) : projectGroups.map(({ type, title }) => {
          const items = projects.filter((project) => project.type === type);
          return (
            <section className="admin-project-section" key={type}>
              <div className="admin-section-heading">
                <div><p className="admin-eyebrow">{type === "web" ? "01 / WEB" : "02 / MOBILE"}</p><h2>{title}</h2></div>
                <span>{String(items.length).padStart(2, "0")} PROJECTS</span>
              </div>
              {error && projects.length === 0 ? (
                <div className="admin-empty-state">Unable to load projects. Check the server connection and retry.</div>
              ) : items.length ? (
                <div className="admin-project-grid">
                  {items.map((project) => <ProjectCard key={project.id} project={project} onEdit={setModalProject} onDelete={setDeletingProject} />)}
                </div>
              ) : (
                <div className="admin-empty-state">No projects yet. Add your first project.</div>
              )}
            </section>
          );
        })}
      </div>

      {(isAdding || modalProject) && (
        <ProjectModal
          key={modalProject?.id || "new-project"}
          project={modalProject}
          onClose={() => { setIsAdding(false); setModalProject(null); }}
          onSave={handleSave}
          saving={saving}
        />
      )}
      {deletingProject && <DeleteConfirmation project={deletingProject} onClose={() => setDeletingProject(null)} onConfirm={handleDelete} loading={saving} error={deleteError} />}
    </main>
  );
}

export { AdminDashboard, AdminLogin };