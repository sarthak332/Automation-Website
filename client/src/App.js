import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chatbot from "./components/Chatbot.jsx";
import HomePage from "./components/HomePage.jsx";
import ContactForm from "./components/ContactForm.jsx";
import FileUpload from "./components/FileUpload.jsx";
import TelegramForm from "./components/TelegramForm.jsx";
import BookingForm from "./components/BookingForm.jsx";
import PaymentPage from "./components/PaymentPage.jsx";






function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/upload" element={<FileUpload />} />
        <Route path="/telegram" element={<TelegramForm />} />
        <Route path="/booking" element={<BookingForm />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

