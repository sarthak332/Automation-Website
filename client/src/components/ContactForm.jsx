import React, { useState } from "react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // execute reCAPTCHA v3
      const token = await window.grecaptcha.execute(
        process.env.REACT_APP_RECAPTCHA_SITE_KEY,
        { action: "submit" }
      );

      const res = await fetch("https://automation-website-1-esqs.onrender.com/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: token,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setErrorMessage(data.error || "Something went wrong.");
      }
    } catch (error) {
      setErrorMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Contact Us</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Message
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            style={styles.textarea}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>

        {successMessage && (
          <p style={{ color: "green", marginTop: "10px" }}>
            {successMessage}
          </p>
        )}
        {errorMessage && (
          <p style={{ color: "red", marginTop: "10px" }}>
            {errorMessage}
          </p>
        )}
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  heading: {
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    fontWeight: "bold",
    display: "flex",
    flexDirection: "column",
    fontSize: "14px",
  },
  input: {
    padding: "8px",
    marginTop: "5px",
    border: "1px solid #aaa",
    borderRadius: "4px",
  },
  textarea: {
    padding: "8px",
    marginTop: "5px",
    border: "1px solid #aaa",
    borderRadius: "4px",
  },
  button: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ContactForm;

