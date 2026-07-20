import cors from "cors";
import express, { type Request, type Response } from "express";

export default interface HttpServer {
  route(method: string, url: string, callback: Function): void;
  listen(port: number): void;
}

export class ExpressAdapter implements HttpServer {
  app: any;

  constructor() {
    const app = express();
    app.use(express.json());
    app.use(cors());
  }

  route(method: string, url: string, callback: Function): void {
    this.app[method](url, async (req: Request, res: Response) => {
      try {
        const output = await callback(req.params, req.body);
        res.json(output);
      } catch (error: any) {
        res.json({ error: error.message });
      }
    });
  }

  listen(port: number): void {
    this.app.listen(port);
  }
}
