import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey="6Ld6KXErAAAAABh2P_JnzSiJ9s-HPe9zKs08xcrp">
      <App />
    </GoogleReCaptchaProvider>
  </React.StrictMode>
);

