import { afterEach, beforeEach, expect, test } from "vitest";
import { Deposit } from "../../src/application/usecase/Deposit.ts";
import { GetAccount } from "../../src/application/usecase/GetAccount.ts";
import { Signup } from "../../src/application/usecase/Signup.ts";
import { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection.ts";
import { PaymentGatewayFake } from "../../src/infra/gateway/PaymentGateway.ts";
import type AccountRepository from "../../src/infra/repository/AccountRepository.ts";
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository.ts";

let databaseConnection: PgPromiseAdapter;
let accountRepository: AccountRepository;

beforeEach(async () => {
  databaseConnection = new PgPromiseAdapter();
  accountRepository = new AccountRepositoryDatabase(databaseConnection);
});

test("Deve fazer dois depósitos do mesmo tipo de recurso em uma conta", async () => {
  const paymentGateway = new PaymentGatewayFake();
  const signup = new Signup(accountRepository);
  const getAccount = new GetAccount(accountRepository);
  const deposit = new Deposit(accountRepository, paymentGateway);
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
  await deposit.execute(inputDeposit);
  const outputGetAccount = await getAccount.execute({
    accountId: outputSignup.accountId,
  });
  expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
  expect(outputGetAccount.balances[0]?.quantity).toBe(200);
});

test("Não deve fazer um depósito em uma conta inexistente", async () => {
  const paymentGateway = new PaymentGatewayFake();
  const deposit = new Deposit(accountRepository, paymentGateway);
  const inputDeposit = {
    accountId: crypto.randomUUID(),
    assetId: "USD",
    quantity: 100,
    creditCardHolder: "JOHN DOE",
    creditCardNumber: "4012001037141112",
    creditCardExpDate: "05/2027",
    creditCardCvv: "123",
  };
  await expect(() => deposit.execute(inputDeposit)).rejects.toThrow(
    new Error("Account not found"),
  );
});

afterEach(async () => {
  await databaseConnection.close();
});
