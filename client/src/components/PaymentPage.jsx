import React, { useState } from "react";
import axios from "axios";

const PaymentPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      if (!name || !email || !amount) {
        alert("Please fill all fields!");
        return;
      }

      setLoading(true);

      // Create order on backend
      const res = await axios.post(
       "https://automation-website-1-esqs.onrender.com/api/create-order",
        {
          name,
          email,
          amount,
          currency: "INR",
        }
      );

      const { orderId, amount: orderAmount, currency } = res.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // frontend key
        amount: orderAmount,
        currency,
        name: "Automation Website",
        description: "Payment for services",
        order_id: orderId,
        handler: async (response) => {
          // send payment info to backend
          await axios.post(
            "https://automation-website-1-esqs.onrender.com/api/payment-success",
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              name,
              email,
              amount: orderAmount,
            }
          );

          alert("Payment successful! PDF receipt sent to your email.");
          setName("");
          setEmail("");
          setAmount("");
        },
        prefill: {
          name,
          email,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("Payment failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded shadow p-8">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Pay with Razorpay
        </h2>
        <input
          type="text"
          placeholder="Name"
          className="border w-full p-2 mb-3 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="border w-full p-2 mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount (INR)"
          className="border w-full p-2 mb-5 rounded"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700 transition duration-300"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
