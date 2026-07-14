import type AccountRepository from "./AccountRepository.ts";
import type Usecase from "./Usecase.ts";

export class Withdraw implements Usecase {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input): Promise<void> {
    const account = await this.accountRepository.getById(input.accountId);
    if (account) {
      account.withdraw(input.assetId, input.quantity);
      await this.accountRepository.update(account);
    }
  }
}

type Input = {
  accountId: string;
  assetId: string;
  quantity: number;
};
