import React from "react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Welcome to the Home Page!
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          This is the home page of your automation website.
        </p>
        <ul className="space-y-4">
          <li>
            <a
              href="/chat"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
            >
              Go to Chatbot
            </a>
          </li>
          <li>
            <a
              href="/contact"
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
            >
              Go to Contact Form
            </a>
          </li>
          <li>
            <a
              href="/upload"
              className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
            >
              Go to File Upload
            </a>
          </li>
          <li>
            <a
              href="/telegram"
              className="block w-full text-center bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
            >
              Go to Telegram Sender
            </a>
          </li>
          <li>
            <a
              href="/booking"
              className="block w-full text-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded transition duration-300"
            >
              Go to Booking Calendar
            </a>
          </li>
          <li>
            <a
              href="/payment"
              className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
            >
              Go to Payment Page
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;

