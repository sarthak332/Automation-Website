import React, { useState } from "react";
import axios from "axios";

function FileUploadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("file", file);

    try {
      const response = await axios.post(
  "https://automation-website-1-esqs.onrender.com/api/upload-file",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 300000, // 5 minutes timeout
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setUploadProgress(percent);
    },
  }
);

      setMessage(response.data.message);
      setUploadProgress(0);
      setFile(null);
      setName("");
      setEmail("");
    } catch (error) {
      setMessage(error.response?.data?.error || "Upload failed.");
      setUploadProgress(0);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>File Upload</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          required
        />

        <label style={styles.label}>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <label style={styles.label}>File</label>
        <input
          type="file"
          onChange={handleFileChange}
          style={{ marginBottom: "15px" }}
        />

        {uploadProgress > 0 && (
          <div style={styles.progressWrapper}>
            <div
              style={{
                ...styles.progressBar,
                width: `${uploadProgress}%`,
              }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        <button type="submit" style={styles.button}>
          Upload
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: "15px",
            color: message.includes("success") ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    background: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#555",
  },
  input: {
    marginBottom: "15px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
  },
  button: {
    padding: "10px 20px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  progressWrapper: {
    width: "100%",
    background: "#eee",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "15px",
  },
  progressBar: {
    height: "20px",
    background: "#4caf50",
    color: "white",
    textAlign: "center",
    lineHeight: "20px",
    transition: "width 0.3s",
  },
};

export default FileUploadForm;
