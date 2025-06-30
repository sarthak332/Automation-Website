import React, { useState } from "react";
import axios from "axios";

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/book", formData);
      setStatus({ success: true, message: res.data.message });
      setFormData({
        name: "",
        email: "",
        date: "",
        time: "",
      });
    } catch (error) {
      console.error(error);
      setStatus({
        success: false,
        message: "Error submitting booking form.",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Book an Appointment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Time</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Book Appointment
        </button>
      </form>

      {status && (
        <p
          className={`mt-4 ${
            status.success ? "text-green-600" : "text-red-600"
          }`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
};

export default BookingForm;
