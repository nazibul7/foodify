import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import userRoutes from "./routes/user.route";
import myresturantRoutes from "./routes/myresturant.route";
import resturantRoutes from "./routes/resturant.route";
import orderRoute from "./routes/order.route";
import { globalErrorHandlerMiddleware } from "./middleweres/globalErrorHandler";

const app = express();

// middlewares

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
  })
);

app.use(
  "/api/order/checkout/webhook",
  express.raw({ type: "application/json" })
);
app.use(express.json());
app.get("/health", async (req: Request, res: Response) => {
  res.status(200).json({
    status: "Health OK!",
  });
});
app.use("/api/v1/user", userRoutes);
app.use("/api/resturant", myresturantRoutes);
app.use("/api/resturant", resturantRoutes);
app.use("/api/order", orderRoute);

// Global error handling middlewares

app.use(globalErrorHandlerMiddleware);

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log("Connected to MongoDB database");
      console.log(`Server is listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`MongoDB connection error ${error}`);
  });
