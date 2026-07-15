import type AccountRepository from "./AccountRepository.ts";
import { ExecuteOrder } from "./ExecuteOrder.ts";
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

    const executeOrder = new ExecuteOrder(this.orderRepository);
    await executeOrder.execute(input.marketId);

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
