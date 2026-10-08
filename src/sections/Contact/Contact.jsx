import { useState } from "react";
import { sendContactMessage } from "../../data/projectsApi";
import sachinImage from "../../assets/sachin.png";
import "./Contact.css";

function Contact() {
  const [imageMotion, setImageMotion] = useState({
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const updateImageMotion = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    setImageMotion({
      x: x * 14,
      y: y * 10,
      rotateX: y * -5,
      rotateY: x * 7,
    });
  };

  const resetImageMotion = () => {
    setImageMotion({
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setStatusMessage("");
  };

 const handleSubmit = async (event) => {
  event.preventDefault();

  if (
    !formData.name.trim() ||
    !formData.email.trim() ||
    !formData.message.trim()
  ) {
    setStatusMessage("PLEASE FILL IN ALL FIELDS.");
    return;
  }

  setIsSending(true);
  setStatusMessage("");

  try {
    const result = await sendContactMessage({
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
      subject: "Portfolio inquiry",
    });

    setFormData({
      name: "",
      email: "",
      message: "",
    });

    if (result?.emailSent) {
      setStatusMessage("MESSAGE SENT SUCCESSFULLY.");
    } else {
      setStatusMessage(
        result?.emailError
          ? `MESSAGE SAVED, BUT EMAIL NOTIFICATION FAILED: ${result.emailError}`
          : "MESSAGE SAVED, BUT EMAIL NOTIFICATION FAILED."
      );
    }
  } catch (error) {
    console.error("Contact submit failed:", error);
    setStatusMessage(
      error.message || "MESSAGE COULD NOT BE SENT."
    );
  } finally {
    setIsSending(false);
  }
};
  return (
    <section className="contact-page">
      <main className="contact-content">
        <div className="contact-top">
          <div className="contact-top-line" />
          <span className="contact-top-label">LET&apos;S TALK</span>
          <h1 className="contact-title"> CONTACT </h1>
        </div>

        <div className="contact-main">
          <div className="contact-left">
            <div className="contact-intro">
              <h1 className="contact-heading">
                LET&apos;S WORK
                <br />
                <span>TOGETHER.</span>
              </h1>
            </div>
          </div>

          <div className="contact-right">
            <div className="contact-image-area" onPointerMove={updateImageMotion} onPointerLeave={resetImageMotion} onPointerUp={resetImageMotion}>
              <div className="contact-image-glow" />

              <div className="contact-image-frame">
                <img
                  src={sachinImage}
                  alt="Sachindeep"
                  className="contact-sachin-image"
                  style={{
                    transform: `
                      translate3d(
                        ${imageMotion.x}px,
                        ${imageMotion.y}px,
                        0
                      )
                      rotateX(${imageMotion.rotateX}deg)
                      rotateY(${imageMotion.rotateY}deg)
                    `,
                  }}
                />
              </div>
            </div>

            <div className="contact-form-card">

              {/* FORM HEADER */}

              <div className="form-card-header">

                <span className="form-card-number">
                  01
                </span>

                <span className="form-card-label">
                  SEND A MESSAGE
                </span>

              </div>

              {/* FORM */}

              <form
                className="contact-form"
                onSubmit={handleSubmit}
              >

                {/* NAME */}

                <label className="form-field">

                  <span>
                    YOUR NAME
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                    required
                  />

                </label>

                {/* EMAIL */}

                <label className="form-field">

                  <span>
                    YOUR EMAIL
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@email.com"
                    autoComplete="email"
                    required
                  />

                </label>

                {/* MESSAGE */}

                <label className="form-field">

                  <span>
                    YOUR MESSAGE
                  </span>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell me about your project"
                    rows="4"
                    required
                  />

                </label>

                {/* BUTTON */}

                <button
                  type="submit"
                  className="contact-submit"
                  disabled={isSending}
                >

                  <span>
                    {isSending
                      ? "SENDING..."
                      : "SEND MESSAGE"}
                  </span>

                  <span className="submit-arrow">
                    ↗
                  </span>

                </button>

                {/* STATUS */}

                {statusMessage && (
                  <p
                    className={`contact-status ${
                      statusMessage.includes(
                        "SUCCESSFULLY"
                      )
                        ? "success"
                        : "error"
                    }`}
                  >
                    {statusMessage}
                  </p>
                )}

              </form>

            </div>

          </div>

        </div>
 
      </main>
    </section>
  );
}
 
export default Contact;
 