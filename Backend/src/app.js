import express from "express";
import cors from "cors";
import morgan from "morgan";
import apiRouter from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

app.get("/", (_req, res) => {
  res.json({ message: "Billing backend running" });
});

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
