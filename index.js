const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const axios = require("axios");
const morgan = require("morgan");
const app = express();

const PORT = 3005;

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
});

app.use(morgan("combined"));
app.use(limiter);

app.use("/bookingService", async (req, res, next) => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/v1/isauthenticated",
      {
        headers: {
          "x-access-token": req.headers["x-access-token"],
        },
      }
    );
    if (response.data.success) {
      next();
    } else {
      return res.status(401).json({
        message: "unauthorised",
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: "unauthorised",
    });
  }
});

app.use(
  "/bookingService",
  createProxyMiddleware({
    target: "http://localhost:3002",
    changeOrigin: true,
  })
);

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
