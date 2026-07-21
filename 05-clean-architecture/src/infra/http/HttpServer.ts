import Hapi from "@hapi/hapi";
import cors from "cors";
import express, { type Express, type Request, type Response } from "express";

export default interface HttpServer {
  route(method: string, url: string, callback: Function): void;
  listen(port: number): void;
}

export class ExpressAdapter implements HttpServer {
  app: Express;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(cors());
  }

  route(method: "get" | "post", url: string, callback: Function): void {
    this.app[method](
      url.replace(/\{|\}/g, ""),
      async (req: Request, res: Response) => {
        try {
          const output = await callback(req.params, req.body);
          res.json(output);
        } catch (error: any) {
          res.json({ error: error.message });
        }
      },
    );
  }

  listen(port: number): void {
    this.app.listen(port);
  }
}

export class HapiAdapter implements HttpServer {
  server: Hapi.Server;

  constructor() {
    this.server = new Hapi.Server({
      port: 3000,
      host: "localhost",
    });
  }

  route(method: "get" | "post", url: string, callback: Function): void {
    this.server.route({
      method,
      path: url.replace(/\:/g, ""),
      handler: async (request: Hapi.Request, reply: Hapi.ResponseToolkit) => {
        try {
          const output = await callback(request.params, request.payload);
          return output;
        } catch (error: any) {
          return reply.response({ error: error.message }).code(422);
        }
      },
    });
  }

  listen(port: number): void {
    this.server.settings.port = port;
    this.server.start();
  }
}
