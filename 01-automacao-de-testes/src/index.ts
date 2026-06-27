import cors from "cors";
import crypto from "crypto";
import express, { type Request, type Response } from "express";
import pgp from "pg-promise";

const app = express();
app.use(express.json());
app.use(cors());

const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

app.post("/signup", async (req: Request, res: Response) => {
  const accountId = crypto.randomUUID();

  const input = req.body;

  await connection.query(
    "INSERT INTO app.account (account_id, name, email, document, password) VALUES ($1, $2, $3, $4, $5)",
    [accountId, input.name, input.email, input.document, input.password],
  );

  res.json({ accountId });
});

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
  const { accountId } = req.params;

  const [accountData] = await connection.query(
    "SELECT * FROM app.account WHERE account_id = $1",
    [accountId],
  );

  const output = {
    accountId: accountData.account_id,
    name: accountData.name,
    email: accountData.email,
    document: accountData.document,
    password: accountData.password,
  };

  res.json(output);
});

app.listen(3000);
