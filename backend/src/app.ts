import { Hono } from "hono";
import { cors } from "hono/cors";
import { sign } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import { CreateReportUseCase } from "./usecase/create-report";
import { ReportRepository } from "./infrastructure/repository/report-repository";
import { createDrizzleD1 } from "./infrastructure/db/client";
import { createReportSchema } from "./schema/report";
import { signInSchema } from "./schema/auth";
import { auth } from "./middleware/auth";

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  JWT_SECRET: string;
  ALLOWED_EMAIL: string;
};

type Variables = {
  user: {
    email: string;
    id: string;
  };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 認証が必要なエンドポイントをグループ化
const authRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();
authRoute.use("*", auth);

app.use("*", cors());

// 認証エンドポイント
app.post("/sign-in", zValidator("json", signInSchema.json), async (c) => {
  const { email, password } = c.req.valid("json");

  if (email !== c.env.ALLOWED_EMAIL) {
    return c.json({ message: "Unauthorized email" }, 401);
  }

  const token = await sign({ email, sub: "admin" }, c.env.JWT_SECRET);
  return c.json({ token });
});

// 認証済みユーザーのみアクセス可能なエンドポイント
authRoute.post(
  "/create-report",
  zValidator("form", createReportSchema.form),
  async (c) => {
    const { itemName, shopName, location, rating, image } = c.req.valid("form");
    const user = c.get("user");

    // 許可されたメールアドレス以外からのリクエストを拒否
    if (user.email !== c.env.ALLOWED_EMAIL) {
      return c.json({ message: "Unauthorized" }, 403);
    }

    let imageUrl: string | undefined;
    if (image) {
      const key = `${Date.now()}-${image.name}`;
      await c.env.BUCKET.put(key, image);
      imageUrl = `https://gourmet-report-images.jackpot88230021.workers.dev/${key}`;
    }

    const db = createDrizzleD1(c.env.DB);
    const repository = new ReportRepository(db);
    const useCase = new CreateReportUseCase(repository);

    const reportId = await useCase.execute({
      itemName,
      shopName,
      location,
      rating,
      imageUrl,
    });

    return c.json({ id: reportId }, 201);
  }
);

// 認証が必要なルートをマウント
app.route("/auth", authRoute);

export default app; 