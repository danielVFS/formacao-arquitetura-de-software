import crypto from "crypto";
import { validateCpf } from "./validateCpf.ts";
import { validateName } from "./validateName.ts";

export default interface AccountService {
  signUpService: (input: SignInputInput) => Promise<SignUpOutput>;
  getAccountService: (accountId: string) => Promise<GetAccountOutput>;
}

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

  async signUpService(input: SignInputInput): Promise<SignUpOutput> {
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

  async getAccountService(accountId: string): Promise<GetAccountOutput> {
    const output = await this.accountData.getById(accountId);
    return output;
  }
}

export class AccountServiceFake implements AccountService {
  async signUpService(input: SignInputInput): Promise<SignUpOutput> {
    return {
      accountId: "1",
    };
  }

  async getAccountService(accountId: string): Promise<GetAccountOutput> {
    return {
      accountId: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      document: "123.456.789-00",
      password: "Password123!",
    };
  }
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

type GetAccountOutput = {
  accountId: string;
  name: string;
  email: string;
  document: string;
  password: string;
};
