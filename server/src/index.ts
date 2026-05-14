import express from "express";
import cors from "cors";
import { requestsRouter } from "./routes/requests.js";
import { authRouter } from "./routes/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/requests", requestsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`RequestHub API running on http://localhost:${PORT}`);
});

export default app;
