import { validateCpf } from "./validateCpf.ts";
import { validateEmail } from "./validateEmail.ts";
import { validateName } from "./validateName.ts";
import { validatePassword } from "./validatePassword.ts";

export default class Account {
  constructor(
    readonly accountId: string,
    readonly name: string,
    readonly email: string,
    readonly document: string,
    readonly password: string,
    readonly balances: Balance[] = [],
  ) {
    if (!validateName(name)) throw new Error("Invalid name");
    if (!validateEmail(email)) throw new Error("Invalid email");
    if (!validateCpf(document)) throw new Error("Invalid document");
    if (!validatePassword(password)) {
      throw new Error("Invalid password");
    }
  }

  static create(
    name: string,
    email: string,
    document: string,
    password: string,
  ) {
    const accountId = crypto.randomUUID();
    const balances: Balance[] = [];
    return new Account(accountId, name, email, document, password, balances);
  }
}

export type Balance = {
  accountId: string;
  quantity: number;
};
