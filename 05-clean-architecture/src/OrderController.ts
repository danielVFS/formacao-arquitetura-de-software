import type { GetOrder } from "./GetOrder.ts";
import type HttpServer from "./HttpServer.ts";
import type { PlaceOrder } from "./PlaceOrder.ts";

export default class OrderController {
  constructor(
    readonly httpServer: HttpServer,
    readonly placeOrder: PlaceOrder,
    readonly getOrder: GetOrder,
  ) {
    httpServer.route(
      "get",
      "/orders/:{orderId}",
      async (params: any, body: any) => {
        const orderId = params.orderId;
        const output = await this.getOrder.execute(orderId);
        return output;
      },
    );

    httpServer.route("post", "/place-order", async (params: any, body: any) => {
      const input = body;
      const output = await this.placeOrder.execute(input);
      return { orderId: output.orderId };
    });
  }
}
