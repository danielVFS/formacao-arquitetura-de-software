import type OrderRepository from "./OrderRepositoryDatabase.ts";
import type UseCase from "./UseCase.ts";

export class ExecuteOrder implements UseCase {
  constructor(readonly orderRepository: OrderRepository) {}

  async execute(marketId: string): Promise<void> {
    while (true) {
      const orders = await this.orderRepository.listByMarketAndStatus(
        marketId,
        "open",
      );
      const highestBuy = orders
        .filter((order: any) => order.side === "buy")
        .sort((a: any, b: any) => b.price - a.price)[0];
      const lowestSell = orders
        .filter((order: any) => order.side === "sell")
        .sort((a: any, b: any) => a.price - b.price)[0];
      if (!highestBuy || !lowestSell) {
        break;
      }
      if (highestBuy.price < lowestSell.price) {
        break;
      }
      const quantity = Math.min(highestBuy.quantity, lowestSell.quantity);
      const price =
        highestBuy.timestamp.getTime() > lowestSell.timestamp.getTime()
          ? lowestSell.price
          : highestBuy.price;
      highestBuy.fill(quantity, price);
      lowestSell.fill(quantity, price);
      await this.orderRepository.update(highestBuy);
      await this.orderRepository.update(lowestSell);
      break;
    }
  }
}
