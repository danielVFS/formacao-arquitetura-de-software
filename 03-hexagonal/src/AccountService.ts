import crypto from "crypto";
import { getById, save } from "./AccountData.ts";
import { validateCpf } from "./validateCpf.ts";
import { validateName } from "./validateName.ts";

export async function signUpService(
  input: SignInputInput,
): Promise<SignUpOutput> {
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

  await save(account);

  return { accountId: account.accountId };
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

export async function getAccountService(
  accountId: string,
): Promise<GetAccountOutput> {
  const output = await getById(accountId);
  return output;
}

type GetAccountOutput = {
  accountId: string;
  name: string;
  email: string;
  document: string;
  password: string;
};
