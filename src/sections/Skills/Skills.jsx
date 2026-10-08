import { useEffect, useState } from "react";
import { getSkills } from "../../data/projectsApi";
import { technologyIconBaseUrl } from "../../data/technologyIcons";
import "./Skills.css";

function SkillCard({ skill }) {
  return (
    <div className="skill-card">
      <img
        className="skill-icon"
        src={skill.icon?.startsWith("http") ? skill.icon : `${technologyIconBaseUrl}/${skill.icon}`}
        alt=""
        aria-hidden="true"
      />
      <h2>{skill.name}</h2>
      <span className="skill-arrow">↗</span>
    </div>
  );
}

function SkillRow({ skillsInRow, rowKey }) {
  return [...skillsInRow, ...skillsInRow, ...skillsInRow].map((skill, index) => (
    <SkillCard
      key={`${rowKey}-${skill.name}-${index}`}
      skill={skill}
    />
  ));
}

function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getSkills()
      .then((items) => {
        if (!active) return;
        setSkills(items);
      })
      .catch((error) => console.error("Skills could not be loaded:", error))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const firstRow = skills.slice(0, 6);
  const secondRow = skills.slice(6, 12);
  const thirdRow = skills.slice(12, 18);

  return (
    <section className="skills-page" id="skills">
      <main className="skills-content">
        <div className="skills-heading-area">
          <div className="skills-header">
            <h1>SKILLS</h1>
          </div>
          <p className="skills-intro">
            TECHNOLOGIES I USE TO BUILD
            <br />
            MODERN DIGITAL EXPERIENCES.
          </p>
        </div>

        {loading ? (
          <div className="skills-marquee" aria-live="polite">
            <div className="skills-row skills-row-right">
              <div className="skills-track">
                <SkillRow skillsInRow={[]} rowKey="row-one" />
              </div>
            </div>
          </div>
        ) : (
          <div className="skills-marquee">
            <div className="skills-row skills-row-right">
              <div className="skills-track">
                <SkillRow skillsInRow={firstRow} rowKey="row-one" />
              </div>
            </div>
            <div className="skills-row skills-row-left">
              <div className="skills-track">
                <SkillRow skillsInRow={secondRow} rowKey="row-two" />
              </div>
            </div>
            <div className="skills-row skills-row-right skills-row-third">
              <div className="skills-track">
                <SkillRow skillsInRow={thirdRow} rowKey="row-three" />
              </div>
            </div>
          </div>
        )}
      </main>
    </section>
  );
}

export default Skills;
