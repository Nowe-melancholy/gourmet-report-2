import { Hono } from "hono";
import { cors } from "hono/cors";
import type { CreateReportCommand } from "./usecase/create-report";
import { CreateReportUseCase } from "./usecase/create-report";
import { ReportRepository } from "./infrastructure/repository/report-repository";
import { createDrizzleD1 } from "./infrastructure/db/client";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

app.post("/create-report", async (c) => {
  const db = createDrizzleD1(c.env.DB);
  const repository = new ReportRepository(db);
  const useCase = new CreateReportUseCase(repository);

  const command = await c.req.json<CreateReportCommand>();
  const reportId = await useCase.execute(command);

  return c.json({ id: reportId }, 201);
});

export default app; 