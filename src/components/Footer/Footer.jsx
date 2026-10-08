
import "./Footer.css";

const technologies = [
  {
    name: "Material UI",
    icon: "M",
    color: "#ff7b3d",
  },
  {
    name: "HTML5",
    icon: "</>",
    color: "#ff7b3d",
  },
  {
    name: "CSS3",
    icon: "#",
    color: "#1e8fff",
  },
  {
    name: "Google Ads / GA4",
    icon: "G",
    color: "#4cd964",
  },
  {
    name: "MongoDB",
    icon: "◉",
    color: "#6ae28c",
  },
  {
    name: "Git",
    icon: "G",
    color: "#f97316",
  },
  {
    name: "GitHub",
    icon: "◌",
    color: "#ffffff",
  },
  {
    name: "Docker",
    icon: "⬢",
    color: "#2ec6ff",
  },
];

function Footer() {
  const marqueeItems = [...technologies, ...technologies];

  return (
    <footer className="footer">

      {/* =========================================
          TECHNOLOGY MARQUEE
      ========================================= */}

      <div className="footer-marquee">
        <div className="footer-marquee-track">

          {marqueeItems.map((technology, index) => (
            <div
              key={`${technology.name}-${index}`}
              className="footer-tech-card"
            >
              {/* Animated Border */}
              <span className="footer-tech-border" />

              {/* Card Content */}
              <div className="footer-tech-card-inner">

                <span
                  className="footer-tech-icon"
                  style={{
                    color: technology.color,
                  }}
                >
                  {technology.icon}
                </span>

                <span className="footer-tech-label">
                  {technology.name}
                </span>

              </div>
            </div>
          ))}

        </div>
      </div>

    </footer>
  );
}

export default Footer;
