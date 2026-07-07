import cors from "cors";
import express, { type Request, type Response } from "express";
import { AccountDataDataBase } from "./AccountData.ts";
import type AccountService from "./AccountService.ts";
import { AccountServiceImpl } from "./AccountService.ts";

class API {
  constructor(readonly accountService: AccountService) {
    const app = express();
    app.use(express.json());
    app.use(cors());

    app.post("/signup", async (req: Request, res: Response) => {
      const input = req.body;

      try {
        const output = await accountService.signUpService(input);
        res.json({ accountId: output.accountId });
      } catch (error: any) {
        res.json({ error: error.message });
      }
    });

    app.get("/accounts/:accountId", async (req: Request, res: Response) => {
      const accountId = req.params.accountId as string;
      const output = await accountService.getAccountService(accountId);
      res.json(output);
    });

    app.listen(3000);
  }
}

const accountData = new AccountDataDataBase();
const accountService = new AccountServiceImpl(accountData);
const api = new API(accountService);
