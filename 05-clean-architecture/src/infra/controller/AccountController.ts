import type { GetAccount } from "../../application/usecase/GetAccount.ts";
import type { Signup } from "../../application/usecase/Signup.ts";
import type HttpServer from "../http/HttpServer.ts";

export default class AccountController {
  constructor(
    readonly httpServer: HttpServer,
    readonly signup: Signup,
    readonly getAccount: GetAccount,
  ) {
    httpServer.route("post", "/signup", async (params: any, body: any) => {
      const input = body;
      const output = await this.signup.execute(input);
      return { accountId: output.accountId };
    });

    httpServer.route(
      "get",
      "/accounts/:{accountId}",
      async (params: any, body: any) => {
        const accountId = params.accountId;
        const output = await this.getAccount.execute({ accountId });
        return output;
      },
    );
  }
}
