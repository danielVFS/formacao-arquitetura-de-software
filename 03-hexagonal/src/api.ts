import cors from "cors";
import express, { type Request, type Response } from "express";
import { getAccountService, signUpService } from "./AccountService.ts";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req: Request, res: Response) => {
  const input = req.body;

  try {
    const output = await signUpService(input);
    res.json({ accountId: output.accountId });
  } catch (error: any) {
    res.json({ error: error.message });
  }
});

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
  const accountId = req.params.accountId as string;
  const output = await getAccountService(accountId);
  res.json(output);
});

app.listen(3000);
