import { useEffect, useState } from "react";
import {
  Code2,
  Monitor,
  Atom,
  Layers3,
  Server,
  Cloud,
  Smartphone,
  Database,
  Rocket,
  BrainCircuit,
  Sparkles,
  BriefcaseBusiness,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";
import { getExperience } from "../../data/projectsApi";
import "./Experience.css";

const getExperienceIcon = (experience) => {
  const text = `${experience.type} ${experience.focus} ${experience.role}`.toLowerCase();
  if (text.includes("mobile")) return Smartphone;
  if (text.includes("cloud")) return Cloud;
  if (text.includes("react")) return Atom;
  if (text.includes("full stack")) return Layers3;
  if (text.includes("backend")) return Server;
  if (text.includes("frontend")) return Monitor;
  if (text.includes("database")) return Database;
  if (text.includes("future")) return Sparkles;
  if (text.includes("advanced")) return BrainCircuit;
  if (text.includes("production")) return Rocket;
  return Code2;
};

const Experience = () => {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    let active = true;
    getExperience()
      .then((items) => { if (active) setExperiences(items); })
      .catch((error) => console.error("Experience could not be loaded:", error));
    return () => { active = false; };
  }, []);

  return (
    <section className="experience-page" id="experience">
      <div className="experience-container">

        {/* HEADER */}

        <div className="experience-heading">
          <div className="experience-heading-cap">
            <span className="experience-heading-cap-icon">
              <BriefcaseBusiness size={15} strokeWidth={1.8} />
            </span>

            <span>JOURNEY</span>

            <span className="experience-heading-cap-line" />
          </div>

          <div className="experience-heading-left">
            <span className="experience-heading-label">
              CAREER JOURNEY
            </span>

            <h2>PROFESSIONAL EXPERIENCE</h2>

            <div className="experience-heading-right">
              <span>
                {experiences.length
                  ? `${experiences[0].year} — ${experiences[experiences.length - 1].period || experiences[experiences.length - 1].year}`
                  : ""}
              </span>

              <p>
                A journey through web, mobile and full stack
                development.
              </p>
            </div>
          </div>
        </div>

        {/* STACK */}

        <div
          className="experience-stack"
          style={{
            "--experience-count": experiences.length,
          }}
        >
          <div className="experience-stage">
            {experiences.map((experience, index) => {
              const Icon = getExperienceIcon(experience);

              return (
                <div
                  className="experience-card-wrapper"
                  key={`${experience.year}-${index}`}
                  style={{
                    zIndex: index + 10,
                    "--card-index": index,
                    "--card-stack-offset": `${index * 10}px`,
                  }}
                >
                  <article className="experience-card">

                    {/* TOP META */}

                    <div className="experience-top-meta">
                      <div className="experience-meta-left">
                        <span className="experience-index">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="experience-meta-dot" />

                        <span>{experience.type}</span>
                      </div>

                      <div className="experience-meta-right">
                        <CalendarDays size={13} />

                        <span>
                          {experience.year} — {experience.period}
                        </span>
                      </div>
                    </div>

                    {/* MAIN CONTENT */}

                    <div className="experience-card-content">

                      {/* YEAR */}

                      <div className="experience-year-column">
                        <div className="experience-icon-box">
                          <Icon size={27} strokeWidth={1.6} />
                        </div>

                        <div className="experience-year">
                          {experience.year}
                        </div>

                        <div className="experience-period">
                          {experience.period}
                        </div>

                        <div className="experience-year-line" />

                        <span className="experience-stage-text">
                          {experience.stage}
                        </span>
                      </div>

                      {/* DETAILS */}

                      <div className="experience-details">
                        <span className="experience-company">
                          {experience.company}
                        </span>

                        <h3>{experience.role}</h3>

                        <p>{experience.description}</p>

                        {/* SKILLS */}

                        <div className="experience-skills">
                          {experience.skills.map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))}
                        </div>

                        {/* BOTTOM INFO */}

                        <div className="experience-detail-footer">
                          <div>
                            <span>FOCUS</span>
                            <strong>{experience.focus}</strong>
                          </div>

                          <div>
                            <span>PROJECT TYPE</span>
                            <strong>{experience.projects}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL */}

                    <div className="experience-side-panel">
                      <div className="experience-side-header">
                        <span>
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span>
                          /{" "}
                          {String(experiences.length).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </div>

                      <div className="experience-side-line">
                        <span />
                      </div>

                      <div className="experience-side-icon">
                        <Icon size={19} strokeWidth={1.5} />
                      </div>

                      <span className="experience-side-label">
                        CORE FOCUS
                      </span>

                      <h4>{experience.focus}</h4>

                      <div className="experience-side-tech">
                        {experience.skills
                          .slice(0, 4)
                          .map((skill, skillIndex) => (
                            <div
                              className="experience-tech-row"
                              key={skill}
                            >
                              <span className="experience-tech-index">
                                0{skillIndex + 1}
                              </span>

                              <span>{skill}</span>

                              <ArrowUpRight
                                size={10}
                                className="experience-tech-arrow"
                              />
                            </div>
                          ))}
                      </div>

                      <div className="experience-side-footer">
                        <span>DEVELOPMENT</span>
                        <span>{experience.year}</span>
                      </div>
                    </div>

                    {/* MINI STATS */}

                    <div className="experience-stats">
                      <div className="experience-stat">
                        <span>ROLE</span>
                        <strong>{experience.type}</strong>
                      </div>

                      <div className="experience-stat">
                        <span>SKILLS</span>
                        <strong>
                          {String(experience.skills.length).padStart(
                            2,
                            "0"
                          )}
                        </strong>
                      </div>

                      <div className="experience-stat">
                        <span>STATUS</span>
                        <strong>{experience.stage}</strong>
                      </div>
                    </div>

                    {/* GRID */}

                    <div className="experience-card-grid" />

                    {/* WATERMARK */}

                    <div className="experience-watermark">
                      {experience.year}
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;