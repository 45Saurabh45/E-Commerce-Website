const express = require("express");
const path = require("path"); // Import path module for handling file paths
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Import Router
const authRouter = require("./routes/auth");
const categoryRouter = require("./routes/categories");
const productRouter = require("./routes/products");
const brainTreeRouter = require("./routes/braintree");
const orderRouter = require("./routes/orders");
const usersRouter = require("./routes/users");
const customizeRouter = require("./routes/customize");
// Import Auth middleware for check user login or not~
const { loginCheck } = require("./middleware/auth");
const CreateAllFolder = require("./config/uploadFolderCreateScript");

CreateAllFolder();

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    console.log(
      "==============Mongodb Database Connected Successfully=============="
    )
  )
  .catch((err) => console.log(err));

// Middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// API routes
app.use("/api", authRouter);
app.use("/api/user", usersRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api", brainTreeRouter);
app.use("/api/order", orderRouter);
app.use("/api/customize", customizeRouter);

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
