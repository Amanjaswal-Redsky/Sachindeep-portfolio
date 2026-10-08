import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

import Navbar from "../../components/Navbar/Navbar";
import heroImage from "../../assets/image.png";

const About = lazy(() => import("../../sections/About/About"));
const Work = lazy(() => import("../../sections/Work/Work"));
const Skills = lazy(() => import("../../sections/Skills/Skills"));
const Experience = lazy(() => import("../../sections/Experience/Experience"));
const Contact = lazy(() => import("../../sections/Contact/Contact"));
const Footer = lazy(() => import("../../components/Footer/Footer"));

import "./Home.css";

const LETTERS = [
  "S",
  "A",
  "C",
  "H",
  "I",
  "N",
  "D",
  "E",
  "E",
  "P",
];

function DeferredSection({
  id,
  Component,
  minHeight = "100vh",
  as: Element = "section",
}) {
  const sectionRef = useRef(null);
  const [isReady, setIsReady] = useState(() => (
    typeof window === "undefined" || !("IntersectionObserver" in window)
  ));

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (!("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsReady(true);
        observer.disconnect();
      }
    }, { rootMargin: "900px 0px" });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <Element
      ref={sectionRef}
      id={id}
      className={`deferred-section deferred-section-${id}`}
      style={{ minHeight }}
      aria-busy={!isReady}
    >
      {isReady ? (
        <Suspense fallback={<div className="section-loading-placeholder" aria-hidden="true" />}>
          <Component />
        </Suspense>
      ) : (
        <div className="section-loading-placeholder" aria-hidden="true" />
      )}
    </Element>
  );
}

function Home({ theme, onToggleTheme }) {
  const [visibleLetters, setVisibleLetters] = useState(LETTERS.length);
  const heroImageRef = useRef(null);
  const heroMotionFrame = useRef(0);
  const heroMotionTarget = useRef({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  const reversingRef = useRef(false);
  const pauseScheduledRef = useRef(false);

  const scheduleHeroImageMotion = () => {
    if (heroMotionFrame.current) return;

    heroMotionFrame.current = window.requestAnimationFrame(() => {
      const { x, y, rotateX, rotateY } = heroMotionTarget.current;
      if (heroImageRef.current) {
        heroImageRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
      heroMotionFrame.current = 0;
    });
  };

  const handleHeroImageMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    heroMotionTarget.current = {
      x: x * 16,
      y: y * 12,
      rotateX: y * -4,
      rotateY: x * 6,
    };
    scheduleHeroImageMotion();
  };

  const resetHeroImageMotion = () => {
    heroMotionTarget.current = { x: 0, y: 0, rotateX: 0, rotateY: 0 };
    scheduleHeroImageMotion();
  };

  useEffect(() => {
    let interval;
    let pauseTimer;

    const startTimer = window.setTimeout(() => {
      setVisibleLetters(1);

      interval = window.setInterval(() => {
        setVisibleLetters((current) => {
          const reversing = reversingRef.current;

          if (
            !reversing &&
            current === LETTERS.length &&
            !pauseScheduledRef.current
          ) {
            pauseScheduledRef.current = true;
            pauseTimer = window.setTimeout(() => {
              pauseScheduledRef.current = false;
              reversingRef.current = true;
            }, 1000);

            return current;
          }

          if (reversing && current === 1) {
            reversingRef.current = false;
            return current;
          }

          return reversing ? current - 1 : current + 1;
        });
      }, 180);
    }, 900);

    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(interval);
      window.clearTimeout(pauseTimer);
      if (heroMotionFrame.current) {
        window.cancelAnimationFrame(heroMotionFrame.current);
      }
    };
  }, []);

  /* =========================================================
     SACHIN
  ========================================================= */

  const sachinLetters = LETTERS.slice(0, 6);


  /* =========================================================
     DEEP
  ========================================================= */

  const deepLetters = LETTERS.slice(6);


  /* =========================================================
     VISIBLE DEEP LETTERS
  ========================================================= */

  const visibleDeepLetters =
    visibleLetters > 6
      ? visibleLetters - 6
      : 0;


  return (
    <>
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <div className="home-page">

        {/* =====================================================
            ANIMATED BACKGROUND
        ===================================================== */}

        <div className="floating-background">

          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={index}
              className="floating-ball"
              style={{
                "--delay": `${index * 0.7}s`,
                "--duration": `${8 + (index % 5) * 2}s`,
                "--left": `${5 + (index * 17) % 90}%`,
                "--size": `${4 + (index % 4) * 3}px`,
              }}
            />
          ))}

        </div>


        {/* =====================================================
            HOME / HERO
        ===================================================== */}

        <section
          id="home"
          className="home-hero"
        >

          <div className="home-hero-content">

            {/* =================================================
                HI I'M
            ================================================= */}

            <span className="home-label">
              Hi, I'm
            </span>


            {/* =================================================
                ANIMATED NAME
            ================================================= */}

            <h1 className="animated-name">

              {/* ===============================================
                  S ALWAYS FIXED
              =============================================== */}

              <span className="fixed-letter">
                S
              </span>


              {/* ===============================================
                  SACHIN OTHER LETTERS
              =============================================== */}

              {sachinLetters
                .slice(1, visibleLetters)
                .map((letter, index) => (
                  <span
                    key={`sachin-${letter}-${index}`}
                    className="name-letter"
                  >
                    {letter}
                  </span>
                ))}


              {/* ===============================================
                  DEEP SECOND LINE
              =============================================== */}

              {visibleLetters > 6 && (
                <>
                  <br />

                  <span className="deep-name-line">

                    {deepLetters
                      .slice(0, visibleDeepLetters)
                      .map((letter, index) => (
                        <span
                          key={`deep-${letter}-${index}`}
                          className="name-letter"
                        >
                          {letter}
                        </span>
                      ))}

                  </span>
                </>
              )}

            </h1>


            {/* =================================================
                SUBTITLE
            ================================================= */}

            <p className="home-subtitle">
              Full Stack Developer
            </p>

          </div>

          <div
            className="home-hero-media"
            aria-hidden="true"
            onPointerMove={handleHeroImageMove}
            onPointerLeave={resetHeroImageMotion}
          >
            <div className="home-hero-media-glow" />
            <img
              ref={heroImageRef}
              src={heroImage}
              alt=""
              className="home-hero-image"
            />
          </div>

        </section>


        {/* =====================================================
            ABOUT
        ===================================================== */}

        <DeferredSection id="about" Component={About} />


        {/* =====================================================
            WORK
        ===================================================== */}

        <DeferredSection id="work" Component={Work} />


        {/* =====================================================
            SKILLS
        ===================================================== */}

        <DeferredSection id="skills" Component={Skills} />


        {/* =====================================================
            EXPERIENCE
        ===================================================== */}

        <DeferredSection id="experience" Component={Experience} />


        {/* =====================================================
            CONTACT
        ===================================================== */}

        <DeferredSection id="contact" Component={Contact} />


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <DeferredSection
          id="footer"
          Component={Footer}
          minHeight="100px"
          as="div"
        />

      </div>
    </>
  );
}

export default Home;