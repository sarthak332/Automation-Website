const express = require('express');
const cors = require('cors');
const contactRoutes = require('./routes/contact');
const paymentRoutes = require("./payment");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(paymentRoutes);

app.use('/api/contact', contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
