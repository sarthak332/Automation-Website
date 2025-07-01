import React, { useState } from "react";

export default function TelegramForm() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("https://automation-website-1-esqs.onrender.com/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("✅ Message sent to Telegram!");
        setMessage("");
      } else {
        setError("Something went wrong sending message to Telegram.");
      }
    } catch (err) {
      console.error(err);
      setError("Error talking to server.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">Send Message to Telegram Bot</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="Your message..."
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send to Telegram
        </button>
      </form>
      {success && <p className="text-green-600 mt-4">{success}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
