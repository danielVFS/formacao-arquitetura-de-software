import { afterEach, beforeEach, expect, test } from "vitest";
import { PgPromiseAdapter } from "../../src/DatabaseConnection.ts";
import Order from "../../src/Order.ts";
import type OrderRepository from "../../src/OrderRepository.ts";
import { OrderRepositoryDatabase } from "../../src/OrderRepository.ts";

let databaseConnection: PgPromiseAdapter;
let orderRepository: OrderRepository;

beforeEach(async () => {
  databaseConnection = new PgPromiseAdapter();
  orderRepository = new OrderRepositoryDatabase(databaseConnection);
});

test("Deve persistir uma orderm de compra", async () => {
  const accountId = crypto.randomUUID();
  const order = Order.create(accountId, "BTC-USD", "buy", 1, 60000);
  await orderRepository.save(order);
  const savedOrder = await orderRepository.getById(order.orderId);

  expect(savedOrder).toBeDefined();
  expect(savedOrder?.orderId).toBe(order.orderId);
  expect(savedOrder?.accountId).toBe(order.accountId);
  expect(savedOrder?.marketId).toBe(order.marketId);
  expect(savedOrder?.side).toBe(order.side);
  expect(savedOrder?.quantity).toBe(order.quantity);
  expect(savedOrder?.price).toBe(order.price);
  expect(savedOrder?.fillQuantity).toBe(order.fillQuantity);
  expect(savedOrder?.fillPrice).toBe(order.fillPrice);
  expect(savedOrder?.status).toBe(order.status);
});

test("Deve listar odens por marketId e status", async () => {
  const marketId = `BTC-USD-${Math.random()}`;
  const accountId = crypto.randomUUID();

  const orderBuy = Order.create(accountId, marketId, "buy", 1, 60000);
  await orderRepository.save(orderBuy);

  const orderSell = Order.create(accountId, marketId, "sell", 1, 60000);
  await orderRepository.save(orderSell);

  const orders = await orderRepository.listByMarketAndStatus(marketId, "open");

  expect(orders.length).toBe(2);
});

afterEach(async () => {
  await databaseConnection.close();
});
