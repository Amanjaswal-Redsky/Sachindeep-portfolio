import { useEffect, useRef, useState } from "react";
 
import {
  Download,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
 
import sachinLogo from "../../assets/sachinlogo.png";
 
import "./Navbar.css";
 
const navItems = [
  {
    name: "About",
    id: "about",
  },
  {
    name: "Work",
    id: "work",
  },
  {
    name: "Skills",
    id: "skills",
  },
  {
    name: "Experience",
    id: "experience",
  },
  {
    name: "Contact",
    id: "contact",
  },
];
 
function Navbar({ theme = "dark", onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const activeSectionRef = useRef("about");
  const navigationFrame = useRef(0);
  const navigationUnlockTimer = useRef(0);
  const navigationCorrectionTimer = useRef(0);
  const navigationLocked = useRef(false);
 
  const navigate = useNavigate();
 
  const closeMenu = () => {
    setMenuOpen(false);
  };
 
  /* =========================================================
     ACTIVE SECTION
  ========================================================= */
 
  useEffect(() => {
    let frame = 0;

    const updateActiveSection = () => {
      if (navigationLocked.current) return;

      const activationLine = Math.min(
        window.innerHeight * 0.32,
        220
      );
      const sections = navItems
        .map((item) => ({
          id: item.id,
          element: document.getElementById(item.id),
        }))
        .filter(({ element }) => element);

      let currentSection = sections[0]?.id || "about";

      sections.forEach(({ id, element }) => {
        if (element.getBoundingClientRect().top <= activationLine) {
          currentSection = id;
        }
      });

      if (activeSectionRef.current === currentSection) return;

      activeSectionRef.current = currentSection;
      setActiveSection(currentSection);
    };

    const handleScroll = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateActiveSection();
      });
    };
 
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    window.addEventListener("resize", handleScroll, {
      passive: true,
    });
 
    handleScroll();
 
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      if (navigationFrame.current) {
        window.cancelAnimationFrame(navigationFrame.current);
        navigationFrame.current = 0;
      }

      if (navigationUnlockTimer.current) {
        window.clearTimeout(navigationUnlockTimer.current);
        navigationUnlockTimer.current = 0;
      }

      if (navigationCorrectionTimer.current) {
        window.clearTimeout(navigationCorrectionTimer.current);
        navigationCorrectionTimer.current = 0;
      }

    };
  }, []);
 
  /*=========================================================
     NAVIGATION
  ========================================================= */
 
  const handleNavigation = (id) => {
    if (navigationFrame.current) {
      window.cancelAnimationFrame(navigationFrame.current);
      navigationFrame.current = 0;
    }

    if (navigationUnlockTimer.current) {
      window.clearTimeout(navigationUnlockTimer.current);
      navigationUnlockTimer.current = 0;
    }

    const scrollToSection = (attempt = 0) => {
      const section = document.getElementById(id);

      if (section) {
        const navbarOffset = 90;
        const targetTop = Math.max(
          section.getBoundingClientRect().top + window.scrollY - navbarOffset,
          0
        );
        const distance = Math.abs(targetTop - window.scrollY);
        const unlockDelay = Math.min(
          2600,
          Math.max(1200, distance * 0.55 + 220)
        );

        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });

        navigationCorrectionTimer.current = window.setTimeout(() => {
          const refreshedSection = document.getElementById(id);

          if (!refreshedSection) return;

          const refreshedTop = Math.max(
            refreshedSection.getBoundingClientRect().top + window.scrollY - navbarOffset,
            0
          );

          if (Math.abs(refreshedTop - window.scrollY) > 12) {
            window.scrollTo({
              top: refreshedTop,
              behavior: "smooth",
            });
          }

          navigationCorrectionTimer.current = 0;
        }, 900);

        navigationUnlockTimer.current = window.setTimeout(() => {
          navigationLocked.current = false;
          navigationUnlockTimer.current = 0;
        }, unlockDelay);

        return;
      }

      if (attempt < 60) {
        navigationFrame.current = window.requestAnimationFrame(() => {
          navigationFrame.current = 0;
          scrollToSection(attempt + 1);
        });
      }
    };

    navigationLocked.current = true;
    activeSectionRef.current = id;
    setActiveSection(id);

    if (window.location.pathname !== "/home") {
      navigate("/home");
      scrollToSection();
    } else {
      scrollToSection();
    }
 
    setMenuOpen(false);
  };
 
  return (
    <header className="navbar">
 
      {/* =====================================================
          LOGO
      ====================================================== */}
 
      <Link
        to="/home"
        className="navbar-logo"
        onClick={() => {
          setMenuOpen(false);
          navigationLocked.current = false;
          activeSectionRef.current = "about";
          setActiveSection("about");
 
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
      >
        <img
          src={sachinLogo}
          alt="Sachin Deep Logo"
          className="navbar-logo-image"
        />
 
        <span>
          Sachindeep Singh
        </span>
      </Link>
 
      {/* =====================================================
          DESKTOP NAVIGATION
      ====================================================== */}
 
      <nav className="desktop-nav">
 
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              activeSection === item.id
                ? "active"
                : ""
            }
            onClick={() =>
              handleNavigation(item.id)
            }
          >
            {item.name}
          </button>
        ))}
 
      </nav>
 
 
      {/* =====================================================
          RIGHT ACTIONS
      ====================================================== */}
 
      <div className="navbar-actions">
 
        {/* THEME */}
 
        <button
          type="button"
          className="theme-button"
          aria-label={
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
          onClick={onToggleTheme}
        >
          {theme === "dark" ? <Sun size={25} /> : <Moon size={25} />}
        </button>
 
 
        {/* RESUME */}
 
        <a
          href="/resume.pdf"
          download
          className="resume-button"
        >
          <Download size={19} />
 
          <span>
            Resume
          </span>
        </a>
 
 
        {/* MOBILE MENU */}
 
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setMenuOpen(
              (previous) => !previous
            )
          }
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>
 
      </div>
 
 
      {/* =====================================================
          MOBILE NAVIGATION
      ====================================================== */}
 
      {menuOpen && (
        <div className="mobile-nav">
 
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                activeSection === item.id
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleNavigation(item.id)
              }
            >
              {item.name}
            </button>
          ))}
 
          <a
            href="/resume.pdf"
            download
            onClick={closeMenu}
          >
            <Download size={18} />
 
            <span>
              Download Resume
            </span>
          </a>
 
        </div>
      )}
 
    </header>
  );
}
 
export default Navbar;