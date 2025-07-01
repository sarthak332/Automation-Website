import React, { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("https://automation-website-1-esqs.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botReply = {
        sender: "bot",
        text: data.reply,
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error talking to AI." },
      ]);
    }

    setInput("");
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        🤖 AI Chatbot
      </h2>

      <div className="h-64 overflow-y-auto space-y-3 border p-4 rounded bg-gray-50 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-xs px-4 py-2 rounded-lg shadow-sm ${
              m.sender === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200 text-gray-800"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="mb-3">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-gray-700 border border-gray-300 rounded p-2"
        />
        {selectedFile && (
          <p className="text-sm text-green-700 mt-2">
            Selected file: {selectedFile.name}
          </p>
        )}
      </div>

      <div className="flex">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
