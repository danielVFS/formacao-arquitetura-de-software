import crypto from "crypto";
import BalanceData from "./BalanceData.ts";
import { validateCpf } from "./validateCpf.ts";
import { validateName } from "./validateName.ts";

// Driver Port
export default interface AccountService {
  signUp: (input: SignInputInput) => Promise<SignUpOutput>;
  getAccount: (accountId: string) => Promise<GetAccountOutput>;
  deposit: (input: DepositInput) => Promise<void>;
}

// Driven Port
export interface AccountServiceAccountData {
  save(account: Account): Promise<void>;
  getById(accountId: string): Promise<Account>;
}

type Account = {
  accountId: string;
  name: string;
  email: string;
  document: string;
  password: string;
};
export class AccountServiceImpl implements AccountService {
  constructor(readonly accountData: AccountServiceAccountData) {}

  async signUp(input: SignInputInput): Promise<SignUpOutput> {
    if (!validateName(input.name)) {
      throw new Error("Invalid name");
    }
    if (!input.email.match(/.+@.+\..+/)) {
      throw new Error("Invalid email");
    }
    if (!validateCpf(input.document)) {
      throw new Error("Invalid document");
    }
    if (
      input.password.length < 8 ||
      !input.password.match(/[a-z]/) ||
      !input.password.match(/[A-Z]/) ||
      !input.password.match(/[0-9]/)
    ) {
      throw new Error("Invalid password");
    }

    const account = {
      accountId: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      document: input.document,
      password: input.password,
    };

    await this.accountData.save(account);

    return { accountId: account.accountId };
  }

  async getAccount(accountId: string): Promise<GetAccountOutput> {
    const account = await this.accountData.getById(accountId);
    const balanceData = new BalanceData(); // -> feito intencionalmente para testar o stub.
    const balances = await balanceData.listByAccountId(accountId);
    const output = {
      accountId: account.accountId,
      name: account.name,
      email: account.email,
      document: account.document,
      password: account.password,
      balances: balances.map((balance) => ({
        assetId: balance.assetId,
        quantity: balance.quantity,
      })),
    };
    return output;
  }

  async deposit(input: DepositInput): Promise<void> {
    const account = await this.accountData.getById(input.accountId);
    if (account) {
      const balanceData = new BalanceData(); // -> feito intencionalmente para testar o stub.
      const balances = await balanceData.listByAccountId(input.accountId);
      const existingBalance = balances.find(
        (balance) => balance.assetId === input.assetId,
      );
      const existingQuantity = existingBalance ? existingBalance.quantity : 0;
      const balance = {
        accountId: input.accountId,
        assetId: input.assetId,
        quantity: existingQuantity + input.quantity,
      };
      await balanceData.upsert(balance);
    }
  }
}

export class AccountServiceFake implements AccountService {
  async signUp(input: SignInputInput): Promise<SignUpOutput> {
    return {
      accountId: "1",
    };
  }

  async getAccount(accountId: string): Promise<GetAccountOutput> {
    return {
      accountId: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      document: "123.456.789-00",
      password: "Password123!",
      balances: [{ assetId: "USD", quantity: 100 }],
    };
  }

  async deposit(input: DepositInput): Promise<void> {}
}

type SignInputInput = {
  name: string;
  email: string;
  document: string;
  password: string;
};

type SignUpOutput = {
  accountId: string;
};

type DepositInput = {
  accountId: string;
  assetId: string;
  quantity: number;
  creditCardHolderName: string;
  creditCardNumber: string;
  creditCardExpDate: string;
  creditCardCvv: string;
};

type GetAccountOutput = {
  accountId: string;
  name: string;
  email: string;
  document: string;
  password: string;
  balances: { assetId: string; quantity: number }[];
};
