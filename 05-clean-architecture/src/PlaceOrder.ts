import type AccountRepository from "./AccountRepository.ts";
import Order from "./Order.ts";
import type OrderRepository from "./OrderRepositoryDatabase.ts";
import type UseCase from "./UseCase.ts";

export class PlaceOrder implements UseCase {
  constructor(
    readonly accountRepository: AccountRepository,
    readonly orderRepository: OrderRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const account = await this.accountRepository.getById(input.accountId);
    const order = Order.create(
      input.accountId,
      input.marketId,
      input.side,
      input.quantity,
      input.price,
    );
    await this.orderRepository.save(order);

    const orders = await this.orderRepository.listByMarketAndStatus(
      input.marketId,
      "open",
    );

    while (true) {
      const highestBuy = orders
        .filter((order) => order.side === "buy")
        .sort((a, b) => b.price - a.price)[0];
      const lowestSell = orders
        .filter((order) => order.side === "sell")
        .sort((a, b) => a.price - b.price)[0];
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

    return {
      orderId: order.orderId,
    };
  }
}

type Input = {
  accountId: string;
  marketId: string;
  side: string;
  quantity: number;
  price: number;
};

type Output = {
  orderId: string;
};
