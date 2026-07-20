import { afterEach, beforeEach, expect, test } from "vitest";
import type AccountRepository from "../../src/AccountRepository.ts";
import { AccountRepositoryDatabase } from "../../src/AccountRepository.ts";
import { PgPromiseAdapter } from "../../src/DatabaseConnection.ts";
import { Deposit } from "../../src/Deposit.ts";
import { GetAccount } from "../../src/GetAccount.ts";
import { PaymentGatewayFake } from "../../src/PaymentGateway.ts";
import { Signup } from "../../src/Signup.ts";
import { Withdraw } from "../../src/Withdraw.ts";

let databaseConnection: PgPromiseAdapter;
let accountRepository: AccountRepository;

beforeEach(async () => {
  databaseConnection = new PgPromiseAdapter();
  accountRepository = new AccountRepositoryDatabase(databaseConnection);
});

test("Deve fazer um saque na conta", async () => {
  const paymentGateway = new PaymentGatewayFake();
  const signup = new Signup(accountRepository);
  const getAccount = new GetAccount(accountRepository);
  const deposit = new Deposit(accountRepository, paymentGateway);
  const withdraw = new Withdraw(accountRepository);
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await signup.execute(inputSignup);
  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 100,
    creditCardHolder: "JOHN DOE",
    creditCardNumber: "4012001037141112",
    creditCardExpDate: "05/2027",
    creditCardCvv: "123",
  };
  await deposit.execute(inputDeposit);
  const inputWithdraw = {
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 50,
  };
  await withdraw.execute(inputWithdraw);
  const outputGetAccount = await getAccount.execute({
    accountId: outputSignup.accountId,
  });
  expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
  expect(outputGetAccount.balances[0]?.quantity).toBe(50);
});

test("Não deve fazer um saque em uma conta inexistente", async () => {
  const withdraw = new Withdraw(accountRepository);
  const inputWithdraw = {
    accountId: crypto.randomUUID(),
    assetId: "USD",
    quantity: 50,
  };
  await expect(() => withdraw.execute(inputWithdraw)).rejects.toThrow(
    new Error("Account not found"),
  );
});

test("Não deve fazer um saque em uma conta sem saldo suficiente", async () => {
  const paymentGateway = new PaymentGatewayFake();
  const signup = new Signup(accountRepository);
  const deposit = new Deposit(accountRepository, paymentGateway);
  const withdraw = new Withdraw(accountRepository);
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await signup.execute(inputSignup);
  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 50,
    creditCardHolder: "JOHN DOE",
    creditCardNumber: "4012001037141112",
    creditCardExpDate: "05/2027",
    creditCardCvv: "123",
  };
  await deposit.execute(inputDeposit);
  const inputWithdraw = {
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 100,
  };
  await expect(() => withdraw.execute(inputWithdraw)).rejects.toThrow(
    new Error("Out of balance"),
  );
});

afterEach(async () => {
  await databaseConnection.close();
});
