import { expect, test } from "vitest";
import Order from "../../src/domain/Order.ts";

test("Deve criar uma orderm de compra", async () => {
  const accountId = crypto.randomUUID();
  const order = Order.create(accountId, "BTC-USD", "buy", 1, 60000);

  expect(order).toBeDefined();
  expect(order.marketId).toBe("BTC-USD");
  expect(order.side).toBe("buy");
  expect(order.quantity).toBe(1);
  expect(order.price).toBe(60000);
  expect(order.fillQuantity).toBe(0);
  expect(order.fillPrice).toBe(0);
  expect(order.status).toBe("open");
  expect(order.timestamp).toBeDefined();
});
