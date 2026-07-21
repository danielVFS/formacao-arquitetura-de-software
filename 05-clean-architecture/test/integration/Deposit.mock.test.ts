import sinon from "sinon";
import { afterEach, beforeEach, expect, test } from "vitest";
import { Deposit } from "../../src/application/usecase/Deposit.ts";
import { GetAccount } from "../../src/application/usecase/GetAccount.ts";
import { Signup } from "../../src/application/usecase/Signup.ts";
import Account from "../../src/domain/Account.ts";
import { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection.ts";
import {
  PaymentGatewayFake,
  PaymentGatewayHttp,
} from "../../src/infra/gateway/PaymentGateway.ts";
import { AxiosAdapter } from "../../src/infra/http/HttpClient.ts";
import type AccountRepository from "../../src/infra/repository/AccountRepository.ts";
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository.ts";

let databaseConnection: PgPromiseAdapter;
let accountRepository: AccountRepository;

beforeEach(async () => {
  databaseConnection = new PgPromiseAdapter();
  accountRepository = new AccountRepositoryDatabase(databaseConnection);
});

test("Deve fazer um depósito em uma conta mock", async () => {
  const httpClient = new AxiosAdapter();
  const paymentGateway = new PaymentGatewayHttp(httpClient);
  const signup = new Signup(accountRepository);
  const getAccount = new GetAccount(accountRepository);
  const deposit = new Deposit(accountRepository, paymentGateway);
  const accountRepositoryMock = sinon.mock(AccountRepositoryDatabase.prototype);
  const paymentGatewayMock = sinon.mock(PaymentGatewayHttp.prototype);
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  accountRepositoryMock.expects("save").once().resolves();
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
  const mockedAccount = new Account(
    outputSignup.accountId,
    inputSignup.name,
    inputSignup.email,
    inputSignup.document,
    inputSignup.password,
    [],
  );
  accountRepositoryMock.expects("update").once().resolves();
  accountRepositoryMock.expects("getById").twice().resolves(mockedAccount);
  paymentGatewayMock
    .expects("processTransaction")
    .once()
    .withArgs({
      creditCardHolder: inputDeposit.creditCardHolder,
      creditCardNumber: inputDeposit.creditCardNumber,
      creditCardExpDate: inputDeposit.creditCardExpDate,
      creditCardCvv: inputDeposit.creditCardCvv,
      amount: inputDeposit.quantity,
    })
    .resolves({
      autorizada: "1",
    });
  await deposit.execute(inputDeposit);
  const outputGetAccount = await getAccount.execute({
    accountId: outputSignup.accountId,
  });
  expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
  expect(outputGetAccount.balances[0]?.quantity).toBe(100);
  accountRepositoryMock.verify();
  accountRepositoryMock.restore();
  paymentGatewayMock.verify();
  paymentGatewayMock.restore();
});

test("Deve fazer um depósito em uma conta com fake", async () => {
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
  const outputGetAccount = await getAccount.execute({
    accountId: outputSignup.accountId,
  });
  expect(outputGetAccount.balances[0]?.assetId).toBe("USD");
  expect(outputGetAccount.balances[0]?.quantity).toBe(100);
});

afterEach(async () => {
  await databaseConnection.close();
});
