import { useEffect, useState } from "react";
import { getServices } from "../../data/projectsApi";
import "./About.css";
import sachinLogo from "../../assets/sachinlogo.png";

function About() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    let active = true;

    getServices()
      .then((items) => {
        if (!active) return;
        setServices(items);
      })
      .catch((error) => console.error("Services could not be loaded:", error));

    return () => {
      active = false;
    };
  }, []);

  const handleMouseMove = (e) => {
    if (window.matchMedia("(hover: none)").matches) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = (x / rect.width - 0.5) * 4;
    const rotateX = (y / rect.height - 0.5) * -4;

    card.style.setProperty("--rotate-x", `${rotateX}deg`);
    card.style.setProperty("--rotate-y", `${rotateY}deg`);
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
  };

  return (
    <section className="about-page" id="about">
      <div className="about-container">
        <div className="about-heading">
          <div className="about-eyebrow">
            <span className="about-eyebrow-line" />
            GET TO KNOW ME
          </div>

          <h1>
            About <span>Me</span>
          </h1>

          <p>
            The developer behind the ideas, code, and digital experiences.
          </p>
        </div>

        <div className="about-main-grid">
          <aside className="about-profile-column">
            <div className="about-profile-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="profile-card-glow" />
              <div className="profile-card-top">
                <span className="profile-label">DEVELOPER PROFILE</span>
                <span className="profile-status"><span />AVAILABLE</span>
              </div>

              <div className="profile-avatar-wrap">
                <div className="profile-avatar-ring">
                  <div className="profile-avatar">
                    <img src={sachinLogo} alt="Sachin Deep logo" />
                  </div>
                </div>
              </div>

              <div className="profile-identity">
                <h2>Sachindeep Singh</h2>
                <p>Full Stack Developer</p>
                <div className="profile-location"><span>◉</span>India</div>
              </div>

              <div className="profile-divider" />

              <div className="profile-meta">
                <div className="profile-meta-row">
                  <span className="profile-meta-icon">⌘</span>
                  <div>
                    <small>PRIMARY FOCUS</small>
                    <strong>Web & Mobile Development</strong>
                  </div>
                </div>

                <div className="profile-meta-row">
                  <span className="profile-meta-icon">⚡</span>
                  <div>
                    <small>TECHNOLOGY</small>
                    <strong>React & React Native</strong>
                  </div>
                </div>

                <div className="profile-meta-row">
                  <span className="profile-meta-icon">↗</span>
                  <div>
                    <small>DEVELOPMENT</small>
                    <strong>Frontend to Backend</strong>
                  </div>
                </div>
              </div>

              <div className="profile-card-footer">
                <span className="profile-footer-dot" />
                BUILDING DIGITAL EXPERIENCES
              </div>
            </div>
          </aside>

          <div className="about-right-content">
            <div className="about-intro-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="about-intro-top">
                <span className="about-intro-label"><span className="about-intro-dot" />INTRODUCTION</span>
                <span className="about-intro-number">01 / ABOUT</span>
              </div>

              <h2>
                Turning ideas into
                <br />
                <span>digital experiences.</span>
              </h2>

              <p>
                I'm a Full Stack Developer focused on building modern web and mobile applications. I work across frontend and backend development, combining clean code, thoughtful design, and practical solutions to create complete digital products.
              </p>

              <div className="about-intro-bottom">
                <div className="about-intro-line" />
                <span>DESIGN <b>·</b> DEVELOP <b>·</b> DEPLOY</span>
              </div>
            </div>

            <div className="about-services-grid">
              {services.map((service) => (
                <article className={`about-service-card ${service.color || "purple"}`} key={service.id} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                  <div className="service-card-top">
                    <div className="service-icon">{service.icon || "⌘"}</div>
                    <span className="service-number">{String(service.sort_order || 1).padStart(2, "0")}</span>
                  </div>

                  <span className="service-category">{service.category || "SERVICE"}</span>
                  <h4>{service.title}</h4>
                  <p>{service.description}</p>

                  <div className="service-skills">
                    {(service.technologies || []).map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>

                  <div className="service-card-bottom">
                    <span className="service-bottom-line" />
                    <span className="service-arrow">↗</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;