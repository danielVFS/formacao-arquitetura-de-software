import type AccountRepository from "./AccountRepository.ts";
import type Mediator from "./Mediator.ts";
import Order from "./Order.ts";
import type OrderRepository from "./OrderRepositoryDatabase.ts";
import type UseCase from "./UseCase.ts";

export class PlaceOrder implements UseCase {
  constructor(
    readonly accountRepository: AccountRepository,
    readonly orderRepository: OrderRepository,
    readonly mediator: Mediator,
  ) {}

  async execute(input: Input): Promise<Output> {
    const order = Order.create(
      input.accountId,
      input.marketId,
      input.side,
      input.quantity,
      input.price,
    );
    await this.orderRepository.save(order);
    await this.mediator.notifyAll("orderPlaced", {
      orderId: order.orderId,
      marketId: input.marketId,
    });

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
