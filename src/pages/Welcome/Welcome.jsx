import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import sachinImage from "../../assets/sachinsir.jpg";
import "./Welcome.css";

/* =========================================================
   PARTICLE TEXT
   ========================================================= */

function ParticleText() {
  const pointsRef = useRef();
  const { size } = useThree();

  const mouseNDC = useRef(
    new THREE.Vector2(999, 999)
  );

  const mouse = useRef(
    new THREE.Vector3(999, 999, 0)
  );

  const immediateMouse = useRef(
    new THREE.Vector3(999, 999, 999)
  );

  const intersectionPoint = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const indicatorRef = useRef();
  const dotRef = useRef();

  const raycaster = useMemo(
    () => new THREE.Raycaster(),
    []
  );

  const plane = useMemo(
    () =>
      new THREE.Plane(
        new THREE.Vector3(0, 0, 1),
        0
      ),
    []
  );

  /* =========================================================
     GLOBAL MOUSE
     ========================================================= */

  useEffect(() => {
    const handleMouseMove = (event) => {
      mouseNDC.current.x =
        (event.clientX / window.innerWidth) * 2 - 1;

      mouseNDC.current.y =
        -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleMouseLeave = (event) => {
      if (!event.relatedTarget) {
        mouseNDC.current.set(999, 999);
      }
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    document.addEventListener(
      "mouseout",
      handleMouseLeave
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      document.removeEventListener(
        "mouseout",
        handleMouseLeave
      );
    };
  }, []);

  useEffect(() => {
    if (!pointsRef.current) return;

    const aspect = size.width / size.height;
    const isMobile = size.width <= 768;

    const textScale = isMobile
      ? Math.min(1, Math.max(0.32, aspect / 1.05))
      : 1;

    pointsRef.current.scale.set(
      textScale,
      textScale,
      textScale
    );
  }, [size.width, size.height]);

  /* =========================================================
     CREATE PARTICLE TEXT
     ========================================================= */

  const {
    geometry,
    particles,
  } = useMemo(() => {
    const canvas =
      document.createElement("canvas");

    const ctx =
      canvas.getContext("2d");

    canvas.width = 2000;
    canvas.height = 500;

    /* =======================================================
       TEXT
       ======================================================= */

    const text = "SACHINDEEP";

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "#ffffff";

    /* =======================================================
       AUTO FIT FONT
       ======================================================= */

    let fontSize = 350;

    const maxTextWidth = 1700;

    do {
      ctx.font =
        `900 ${fontSize}px Arial Black, Arial, sans-serif`;

      if (
        ctx.measureText(text).width <=
        maxTextWidth
      ) {
        break;
      }

      fontSize -= 5;
    } while (fontSize > 100);

    ctx.font =
      `900 ${fontSize}px Arial Black, Arial, sans-serif`;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX =
      canvas.width / 2;

    const centerY =
      canvas.height / 2;

    /* =======================================================
       CENTER SACHINDEEP
       ======================================================= */

    ctx.fillText(
      text,
      centerX,
      centerY
    );

    /* =======================================================
       LETTER COLOR PALETTES
       ======================================================= */

    const palettes = [
      [
        "#DCD7FF",
        "#B9B0FF",
        "#9B8CFF",
      ],

      [
        "#DCD7FF",
        "#B9B0FF",
        "#9B8CFF",
      ],

      [
        "#E8E5FF",
        "#C8C0FF",
        "#A995FF",
      ],

      [
        "#E8E5FF",
        "#C8C0FF",
        "#A995FF",
      ],

      [
        "#A78BFA",
        "#C084FC",
        "#E9A8FF",
      ],

      [
        "#A78BFA",
        "#C084FC",
        "#E9A8FF",
      ],

      [
        "#C084FC",
        "#E9A8FF",
        "#F0B6D8",
      ],

      [
        "#C084FC",
        "#E9A8FF",
        "#F0B6D8",
      ],

      [
        "#E9A8FF",
        "#F0B6D8",
        "#FFB38A",
      ],

      [
        "#F0B6D8",
        "#FFB38A",
        "#FF9E63",
      ],
    ];

    /* =======================================================
       CHARACTER WIDTHS
       ======================================================= */

    const characterWidths = [];

    for (const character of text) {
      characterWidths.push(
        ctx.measureText(character).width
      );
    }

    const totalWidth =
      characterWidths.reduce(
        (total, width) =>
          total + width,
        0
      );

    const startX =
      centerX -
      totalWidth / 2;

    const characterRanges = [];

    let currentX = startX;

    characterWidths.forEach(
      (width, index) => {
        characterRanges.push({
          index,
          start: currentX,
          end: currentX + width,
        });

        currentX += width;
      }
    );

    /* =======================================================
       READ TEXT PIXELS
       ======================================================= */

    const imageData =
      ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

    const particleData = [];

    const gap = size.width <= 768 ? 14 : 12;

    for (
      let y = 0;
      y < canvas.height;
      y += gap
    ) {
      for (
        let x = 0;
        x < canvas.width;
        x += gap
      ) {
        const pixelIndex =
          (y * canvas.width + x) * 4;

        const alpha =
          imageData.data[
            pixelIndex + 3
          ];

        if (alpha > 100) {
          /* =================================================
             FIND LETTER
             ================================================= */

          let characterIndex = 0;

          for (
            let i = 0;
            i < characterRanges.length;
            i++
          ) {
            const range =
              characterRanges[i];

            if (
              x >= range.start &&
              x <= range.end
            ) {
              characterIndex = i;
              break;
            }
          }

          const range =
            characterRanges[
              characterIndex
            ];

          let localPosition =
            (x - range.start) /
            (range.end - range.start);

          localPosition =
            THREE.MathUtils.clamp(
              localPosition,
              0,
              1
            );

          /* ===============================================
             FINAL POSITION
             =============================================== */

          const targetX =
            (x / canvas.width - 0.5) *
            32;

          const targetY =
            -(y / canvas.height - 0.5) *
            8.5;

          /* ===============================================
             RANDOM START POSITION
             =============================================== */

          const angle =
            Math.random() *
            Math.PI *
            2;

          const spread =
            12 +
            Math.random() * 18;

          const startParticleX =
            targetX +
            Math.cos(angle) *
              spread;

          const startParticleY =
            targetY +
            Math.sin(angle) *
              spread;

          const startParticleZ =
            (Math.random() - 0.5) *
            18;

          particleData.push({
            x: startParticleX,
            y: startParticleY,
            z: startParticleZ,

            targetX,
            baseTargetX: targetX,
            targetY,

            targetZ:
              (Math.random() - 0.5) *
              0.15,

            startX: startParticleX,
            startY: startParticleY,
            startZ: startParticleZ,

            vx: 0,
            vy: 0,
            vz: 0,

            random:
              Math.random() *
              Math.PI *
              2,

            characterIndex,
            localPosition,

            baseSize:
              5.5 +
              Math.random() *
                5.5,

            delay:
              Math.random() *
              0.65,
          });
        }
      }
    }

    /* =======================================================
       GEOMETRY
       ======================================================= */

    const geometry =
      new THREE.BufferGeometry();

    const positions =
      new Float32Array(
        particleData.length * 3
      );

    const colors =
      new Float32Array(
        particleData.length * 3
      );

    const sizes =
      new Float32Array(
        particleData.length
      );

    const color =
      new THREE.Color();

    particleData.forEach(
      (particle, index) => {
        positions[index * 3] =
          particle.x;

        positions[
          index * 3 + 1
        ] = particle.y;

        positions[
          index * 3 + 2
        ] = particle.z;

        sizes[index] =
          particle.baseSize;

        const palette =
          palettes[
            particle.characterIndex
          ] ||
          palettes[
            particle.characterIndex %
              palettes.length
          ];

        const color1 =
          new THREE.Color(
            palette[0]
          );

        const color2 =
          new THREE.Color(
            palette[1]
          );

        const color3 =
          new THREE.Color(
            palette[2]
          );

        const p =
          particle.localPosition;

        if (p < 0.5) {
          color.lerpColors(
            color1,
            color2,
            p * 2
          );
        } else {
          color.lerpColors(
            color2,
            color3,
            (p - 0.5) * 2
          );
        }

        color.offsetHSL(
          (Math.random() - 0.5) *
            0.025,
          0.04,
          Math.random() * 0.08
        );

        colors[index * 3] =
          color.r;

        colors[
          index * 3 + 1
        ] = color.g;

        colors[
          index * 3 + 2
        ] = color.b;
      }
    );

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        colors,
        3
      )
    );

    geometry.setAttribute(
      "aSize",
      new THREE.BufferAttribute(
        sizes,
        1
      )
    );

    return {
      geometry,
      particles: particleData,
    };
  }, []);

  useEffect(() => {
    const wordGap = 0;

    particles.forEach((particle) => {
      particle.targetX =
        particle.baseTargetX +
        (particle.characterIndex < 6
          ? -wordGap / 2
          : wordGap / 2);
    });
  }, [particles, size.width]);

  /* =========================================================
     ANIMATION
     ========================================================= */

  useFrame((state) => {
    const time =
      state.clock.getElapsedTime();

    const introDuration = 2.2;

    /* =======================================================
       MOUSE WORLD POSITION
       ======================================================= */

    if (
      mouseNDC.current.x !== 999 &&
      mouseNDC.current.y !== 999
    ) {
      raycaster.setFromCamera(
        mouseNDC.current,
        state.camera
      );

      const hit =
        raycaster.ray.intersectPlane(
          plane,
          intersectionPoint
        );

      if (hit) {
        immediateMouse.current.copy(
          intersectionPoint
        );

        mouse.current.lerp(
          intersectionPoint,
          0.28
        );
      }
    } else {
      immediateMouse.current.set(
        999,
        999,
        999
      );
    }

    /* =======================================================
       CURSOR RING
       ======================================================= */

    if (indicatorRef.current) {
      indicatorRef.current.position.set(
        mouse.current.x,
        mouse.current.y,
        2
      );

      indicatorRef.current.rotation.z +=
        0.01;
    }

    /* =======================================================
       CURSOR DOT
       ======================================================= */

    if (dotRef.current) {
      dotRef.current.position.set(
        immediateMouse.current.x,
        immediateMouse.current.y,
        2.2
      );
    }

    if (!pointsRef.current) {
      return;
    }

    const positionAttribute =
      pointsRef.current.geometry
        .attributes.position;

    const position =
      positionAttribute.array;

    /* =======================================================
       PARTICLE ANIMATION
       ======================================================= */

    particles.forEach(
      (particle, index) => {
        const localTime =
          THREE.MathUtils.clamp(
            (time -
              particle.delay) /
              introDuration,
            0,
            1
          );

        const introProgress =
          1 -
          Math.pow(
            1 - localTime,
            3
          );

        /* ===================================================
           INTRO
           =================================================== */

        if (localTime < 1) {
          particle.x =
            THREE.MathUtils.lerp(
              particle.startX,
              particle.targetX,
              introProgress
            );

          particle.y =
            THREE.MathUtils.lerp(
              particle.startY,
              particle.targetY,
              introProgress
            );

          particle.z =
            THREE.MathUtils.lerp(
              particle.startZ,
              particle.targetZ,
              introProgress
            );

          position[index * 3] =
            particle.x;

          position[
            index * 3 + 1
          ] = particle.y;

          position[
            index * 3 + 2
          ] = particle.z;

          return;
        }

        /* ===================================================
           FLOATING
           =================================================== */

        const floatX =
          Math.sin(
            time * 0.7 +
              particle.random
          ) * 0.025;

        const floatY =
          Math.cos(
            time * 0.8 +
              particle.random
          ) * 0.025;

        const targetX =
          particle.targetX +
          floatX;

        const targetY =
          particle.targetY +
          floatY;

        /* ===================================================
           RETURN SPRING
           =================================================== */

        particle.vx +=
          (targetX -
            particle.x) *
          0.022;

        particle.vy +=
          (targetY -
            particle.y) *
          0.022;

        particle.vz +=
          (particle.targetZ -
            particle.z) *
          0.022;

        /* ===================================================
           MOUSE
           =================================================== */

        const im =
          immediateMouse.current;

        const dx =
          particle.x - im.x;

        const dy =
          particle.y - im.y;

        const distance =
          Math.sqrt(
            dx * dx +
              dy * dy
          );

        const radius = 4.5;

        if (
          im.x !== 999 &&
          distance < radius
        ) {
          const safeDistance =
            Math.max(
              distance,
              0.01
            );

          const force =
            Math.pow(
              1 -
                distance /
                  radius,
              2
            );

          particle.vx +=
            (dx /
              safeDistance) *
            force *
            0.85;

          particle.vy +=
            (dy /
              safeDistance) *
            force *
            0.85;

          particle.vz +=
            force * 0.55;

          particle.vx +=
            Math.sin(
              time * 6 +
                particle.random
            ) *
            force *
            0.035;

          particle.vy +=
            Math.cos(
              time * 6.5 +
                particle.random
            ) *
            force *
            0.035;
        }

        /* ===================================================
           DAMPING
           =================================================== */

        particle.vx *= 0.88;
        particle.vy *= 0.88;
        particle.vz *= 0.88;

        /* ===================================================
           UPDATE
           =================================================== */

        particle.x +=
          particle.vx;

        particle.y +=
          particle.vy;

        particle.z +=
          particle.vz;

        position[index * 3] =
          particle.x;

        position[
          index * 3 + 1
        ] = particle.y;

        position[
          index * 3 + 2
        ] = particle.z;
      }
    );

    positionAttribute.needsUpdate =
      true;
  });

  return (
    <>
      {/* =====================================================
          CURSOR
          ===================================================== */}

      <group>
        <mesh ref={indicatorRef}>
          <ringGeometry
            args={[0.9, 1, 32]}
          />

          <meshBasicMaterial
            color={0xf2f2f2}
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh ref={dotRef}>
          <circleGeometry
            args={[0.12, 22]}
          />

          <meshBasicMaterial
            color={0xf59e0b}
          />
        </mesh>
      </group>

      {/* =====================================================
          PARTICLES
          ===================================================== */}

      <points
        ref={pointsRef}
        geometry={geometry}
      >
        <pointsMaterial
          vertexColors
          size={size.width <= 768 ? 0.12 : 0.14}
          transparent
          opacity={size.width <= 768 ? 0.99 : 1}
          depthWrite={false}
          depthTest={false}
          blending={
            THREE.NormalBlending
          }
          sizeAttenuation
        />
      </points>
    </>
  );
}

/* =========================================================
   SCENE
   ========================================================= */

function Scene() {
  return (
    <>
      <ParticleText />

      <ambientLight intensity={1} />
    </>
  );
}

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="app">

      {/* ===================================================
          BACKGROUND GLOWS
          =================================================== */}

      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />
      <div className="background-glow glow-three" />
      <div className="background-glow glow-four" />

      {/* ===================================================
          MOVING BALLS
          =================================================== */}

      <div className="moving-ball ball-one" />
      <div className="moving-ball ball-two" />
      <div className="moving-ball ball-three" />
      <div className="moving-ball ball-four" />
      <div className="moving-ball ball-five" />
      <div className="moving-ball ball-six" />
      <div className="moving-ball ball-seven" />
      <div className="moving-ball ball-eight" />

      {/* ===================================================
          GRID
          =================================================== */}

      <div className="ambient-grid" />

      {/* ===================================================
          TOP TEXT
          =================================================== */}

      <div className="top-text">
        <span>
          SACHIN DEEP
          <span className="separator"> • </span>
          FULL STACK DEVELOPER
          <span className="separator"> • </span>
          INDIA
        </span>
      </div>


      {/* ===================================================
    IMAGE ABOVE SACHINDEEP
    =================================================== */}

<div className="profile-image-wrapper">
  <img
  src={sachinImage}
  alt="Sachin Deep"
  className="profile-image"
/>
</div>

      {/* ===================================================
          THREE.JS CANVAS
          =================================================== */}

      <Canvas
        camera={{
          position: [0, 0, 30],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: false,
          alpha: true,
        }}
        dpr={[1, 1.1]}
        performance={{ min: 0.65 }}
      >
        <Scene />
      </Canvas>

      {/* ===================================================
          PORTFOLIO BUTTON
          =================================================== */}

      <div className="portfolio-content">
        <div className="developer-role">
           Full Stack Developer
           </div>
        
                <button
            className="portfolio-button"
            onClick={() => navigate("/home")}
            >
            <span className="button-text">
                ENTER PORTFOLIO
            </span>

            <span className="button-arrow">
                →
            </span>
            </button>
      </div>

    </div>
  );
}