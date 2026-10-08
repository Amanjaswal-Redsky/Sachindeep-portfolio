import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import workImage from "../../assets/work.png";
import { getTechnologyIcon, parseTechnologies, technologyIconBaseUrl } from "../../data/technologyIcons";
import { supabase } from "../../lib/supabase";
import "./Work.css";

let modalLockCount = 0;
let previousPageStyles;
let lockedScrollY = 0;

function useProjectModalPageLock(onClose) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (modalLockCount === 0) {
      lockedScrollY = window.scrollY;
      previousPageStyles = {
        htmlOverflow: document.documentElement.style.overflow,
        bodyOverflow: document.body.style.overflow,
        bodyPosition: document.body.style.position,
        bodyTop: document.body.style.top,
        bodyWidth: document.body.style.width,
      };

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.style.width = "100%";
    }

    modalLockCount += 1;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      modalLockCount -= 1;

      if (modalLockCount === 0 && previousPageStyles) {
        document.documentElement.style.overflow = previousPageStyles.htmlOverflow;
        document.body.style.overflow = previousPageStyles.bodyOverflow;
        document.body.style.position = previousPageStyles.bodyPosition;
        document.body.style.top = previousPageStyles.bodyTop;
        document.body.style.width = previousPageStyles.bodyWidth;
        window.scrollTo(0, lockedScrollY);
        previousPageStyles = null;
      }
    };
  }, []);
}

/* =========================================================
   PROJECT IMAGE
========================================================= */

function ProjectImage({ project, featured = false }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`project-visual ${
        featured ? "project-visual-featured" : ""
      }`}
    >
      {!imageError ? (
        <img
          src={project.image_url}
          alt={project.title}
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="project-image-placeholder">
          <div className="placeholder-grid" />
          <span>PROJECT IMAGE</span>
          <small>{project.title}</small>
        </div>
      )}

      <div className="project-image-shade" />


      <div className="project-image-glow" />
    </div>
  );
}

/* =========================================================
   STANDARD PROJECT CARD
========================================================= */

function ProjectCard({ project, onSelect }) {
  const technologies = parseTechnologies(project.technology);
  const visibleTechnologies = technologies.slice(0, 3);
  const hiddenTechnologyCount = Math.max(technologies.length - visibleTechnologies.length, 0);

  return (
    <article
      className="work-project-card"
    >

      <ProjectImage project={project} />

      <div className="work-project-info">

        <div className="project-title-row">

          <h3>
            {project.title}
          </h3>

        </div>

        <p>
          {project.description}
        </p>

        <div className="project-card-footer">
          <div className="project-tech-list" aria-label="Technologies">
            {visibleTechnologies.map((technology, index) => {
              const technologyIcon = getTechnologyIcon(technology);
              const iconSource = technologyIcon?.icon;
              const technologyClass = technology.toLowerCase().replace(/[^a-z0-9]+/g, "-");

              return (
                <span className="project-tech-chip" key={`${technology}-${index}`}>
                  <span className={`project-tech-mark project-tech-mark-${technologyClass}`} aria-hidden="true">
                    {iconSource ? (
                      <img
                        className={`project-tech-icon ${["Three.js", "Vercel", "GitHub"].includes(technology) ? "project-tech-icon-monochrome" : ""}`}
                        src={iconSource.startsWith("http") ? iconSource : `${technologyIconBaseUrl}/${iconSource}`}
                        alt=""
                        onError={(event) => { event.currentTarget.hidden = true; }}
                      />
                    ) : technology.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="project-tech-name">{technology}</span>
                </span>
              );
            })}
            {hiddenTechnologyCount > 0 && (
              <span className="project-tech-chip project-tech-chip-more">+{hiddenTechnologyCount}</span>
            )}
          </div>

          <button
            type="button"
            className="project-card-action"
            onClick={() => onSelect(project)}
            aria-label={`View case study for ${project.title}`}
          >
            <span className="project-case-study">View Case Study <span aria-hidden="true">→</span></span>
            <span className="project-card-arrow" aria-hidden="true">↗</span>
          </button>
        </div>

      </div>

    </article>
  );
}

function ProjectDetailModal({ project, onClose }) {
  const technologies = parseTechnologies(project.technology);
  useProjectModalPageLock(onClose);

  return createPortal(
    <div className="project-detail-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <article className="project-detail-modal" role="dialog" aria-modal="true" aria-labelledby="project-detail-title">
        <button type="button" className="project-detail-close" onClick={onClose} aria-label="Close project details">×</button>
        <ProjectImage project={project} featured />
        <div className="project-detail-content">
          <div className="project-detail-heading">
            <div className="project-detail-labels">
              <span className="project-detail-type">{project.type === "mobile" ? "Mobile application" : "Web application"}</span>
              <span className="project-detail-category">{project.category || "Project"}</span>
            </div>
            <h2 id="project-detail-title">{project.title}</h2>
            <p>{project.description}</p>
          </div>
          <section className="project-detail-technologies" aria-labelledby="project-detail-technologies-title">
            <h3 id="project-detail-technologies-title">Built with</h3>
            <div className="project-detail-tech-list">
              {technologies.length ? technologies.map((technology, index) => {
                const technologyIcon = getTechnologyIcon(technology);
                const iconSource = technologyIcon?.icon;
                const technologyClass = technology.toLowerCase().replace(/[^a-z0-9]+/g, "-");

                return (
                  <span className="project-detail-tech-chip" key={`${technology}-${index}`}>
                    <span className={`project-tech-mark project-tech-mark-${technologyClass}`} aria-hidden="true">
                      {iconSource ? (
                        <img
                          className={`project-tech-icon ${["Three.js", "Vercel", "GitHub"].includes(technology) ? "project-tech-icon-monochrome" : ""}`}
                          src={iconSource.startsWith("http") ? iconSource : `${technologyIconBaseUrl}/${iconSource}`}
                          alt=""
                          onError={(event) => { event.currentTarget.hidden = true; }}
                        />
                      ) : technology.slice(0, 1).toUpperCase()}
                    </span>
                    {technology}
                  </span>
                );
              }) : <span className="project-detail-no-tech">No technologies listed</span>}
            </div>
          </section>
          {(project.project_url || project.github_url) && (
            <div className="project-detail-links">
              {project.project_url && <a href={project.project_url} target="_blank" rel="noreferrer">Live project <span aria-hidden="true">↗</span></a>}
              {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer">Source code <span aria-hidden="true">↗</span></a>}
            </div>
          )}
        </div>
      </article>
    </div>,
    document.body,
  );
}

/* =========================================================
   PROJECT MODAL
========================================================= */

function ProjectsModal({
  title,
  projects,
  type,
  onClose,
  onSelect,
}) {
  useProjectModalPageLock(onClose);

  const isWeb = type === "web";

  return (
    <div
      className="projects-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="projects-modal">

        {/* =================================================
            MODAL TOP BAR
        ================================================= */}

        <div className="modal-top-bar">

          <div className="modal-location">

            <span className="location-dot" />

            <span>
              PORTFOLIO / {isWeb ? "WEB" : "MOBILE"}
            </span>

          </div>

          <div className="modal-top-right">

            <span>
              {String(projects.length).padStart(2, "0")}{" "}
              PROJECTS
            </span>

            <span className="top-separator">
              /
            </span>

            <span>
              2026
            </span>

          </div>

        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="projects-modal-header">

          <div className="modal-title-area">

            <div className="modal-eyebrow">


            </div>
            <h2>
              {title}
              <span>.</span>
            </h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close projects"
          >

            <span className="close-icon">
              <span />
              <span />
            </span>
          </button>

        </header>

        <div className="modal-scroll">

          <div className="modal-content">

            {projects.length === 0 && (
              <div className="work-empty-state">No projects available.</div>
            )}

            {projects.length > 0 && (
              <div className="projects-section">


                <div className="projects-grid">

                  {projects.map(
                    (project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onSelect={onSelect}
                      />
                    )
                  )}

                </div>

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="modal-footer">

          <div className="modal-footer-brand">

            <span className="footer-symbol">
              S
            </span>

            <span>
              CODENEX
            </span>

          </div>

          <div className="modal-footer-center">

            <span>
              {isWeb
                ? "WEB DEVELOPMENT"
                : "REACT NATIVE DEVELOPMENT"}
            </span>

            <span className="footer-dot">
              •
            </span>

            <span>
              SELECTED WORK
            </span>

          </div>

          <button
            type="button"
            className="modal-footer-close"
            onClick={onClose}
          >
            CLOSE

            <span>
              ×
            </span>
          </button>

        </footer>

      </div>

    </div>
  );
}

/* =========================================================
   WORK PAGE
========================================================= */

function Work() {
  const [modal, setModal] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) throw error;
        if (active) setProjects(data || []);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const closeModal = () => {
    setModal(null);
  };

  const activeProjects =
    modal === "web"
      ? projects.filter(({ type }) => type === "web")
      : modal === "mobile"
      ? projects.filter(({ type }) => type === "mobile")
      : [];

  return (
    <section
      id="work"
      className="work-page"
    >

      <div className="work-background">

        <div className="work-orb work-orb-one" />
        <div className="work-orb work-orb-two" />

        <div className="work-grid-lines" />

      </div>

      <div className="work-container">

        {/* =================================================
            LEFT
        ================================================= */}

        <div className="work-left">

          <div className="work-eyebrow">

            <span className="work-eyebrow-line" />

            SELECTED WORK

          </div>

          <h2 className="work-title">

            My{" "}

            <span>
              Work
            </span>

            <sup>05</sup>

          </h2>

          <p className="work-intro">
            A collection of web applications,
            interactive experiences and mobile
            products built with modern technologies
            and a focus on thoughtful digital
            experiences.
          </p>

          <div className="work-status">

            <span className="status-dot" />

            <span>
              OPEN TO CREATIVE PROJECTS
            </span>

          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="work-buttons">

            {/* WEB */}

            <button
              type="button"
              className={`work-main-button ${
                modal === "web"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setModal("web")
              }
            >

              <div className="button-number">
                01
              </div>

              <div className="button-left">

                <div className="button-content">

                  <span className="button-category">
                    DEVELOPMENT
                  </span>

                  <strong>
                    Web Projects
                  </strong>

                  <small>
                    React · Three.js · Firebase
                  </small>

                </div>

              </div>

              <span className="button-arrow">
                ↗
              </span>

            </button>

            {/* MOBILE */}

            <button
              type="button"
              className={`work-main-button ${
                modal === "mobile"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setModal("mobile")
              }
            >

              <div className="button-number">
                02
              </div>

              <div className="button-left">

                <div className="button-content">

                  <span className="button-category">
                    MOBILE DEVELOPMENT
                  </span>

                  <strong>
                    Mobile Apps
                  </strong>

                  <small>
                    React Native · Firebase
                  </small>

                </div>

              </div>

              <span className="button-arrow">
                ↗
              </span>

            </button>

          </div>

        </div>

        {/* =================================================
            RIGHT DECORATIVE AREA
        ================================================= */}

        <div className="work-right-visual" aria-hidden="true">
          <div className="work-right-visual-glow" />
          <img
            src={workImage}
            alt=""
            className="work-right-image"
          />
        </div>

      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {modal && (
        <ProjectsModal
          type={modal}
          title={
            modal === "web"
              ? "Web Projects"
              : "Mobile Apps"
          }
          projects={activeProjects}
          onClose={closeModal}
          onSelect={setSelectedProject}
        />
      )}

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

    </section>
  );
}

export default Work;