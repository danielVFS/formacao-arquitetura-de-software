import sinon from "sinon";
import { expect, test } from "vitest";
import { AccountDataDataBase } from "../../src/AccountData.ts";
import { AccountServiceImpl } from "../../src/AccountService.ts";
import BalanceData from "../../src/BalanceData.ts";
import { PaymentGatewayHttp } from "../../src/PaymentGateway.ts";

test("Deve criar uma conta", async () => {
  const accountData = new AccountDataDataBase();
  const accountService = new AccountServiceImpl(accountData);

  const input = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const outputSignup = await accountService.signUp(input);
  const outputGetAccount = await accountService.getAccount(
    outputSignup.accountId,
  );

  expect(outputGetAccount.accountId).toBe(outputSignup.accountId);
  expect(outputGetAccount.name).toBe(input.name);
  expect(outputGetAccount.email).toBe(input.email);
  expect(outputGetAccount.document).toBe(input.document);
});

test("Deve fazer um depósito em uma conta", async () => {
  const accountData = new AccountDataDataBase();
  const accountService = new AccountServiceImpl(accountData);

  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await accountService.signUp(inputSignup);
  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 100,
    creditCardHolderName: "John Doe",
    creditCardNumber: "4012001037141112",
    creditCardExpDate: "05/2027",
    creditCardCvv: "123",
  };
  await accountService.deposit(inputDeposit);
  const outputGetAccount = await accountService.getAccount(
    outputSignup.accountId,
  );

  expect(outputGetAccount.balances[0]?.assetId).toEqual("USD");
  expect(outputGetAccount.balances[0]?.quantity).toEqual(100);
});

test("Deve fazer dois depósitos do mesmo tipo de recurso em uma conta", async () => {
  const accountData = new AccountDataDataBase();
  const accountService = new AccountServiceImpl(accountData);

  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await accountService.signUp(inputSignup);
  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 100,
    creditCardHolderName: "John Doe",
    creditCardNumber: "4012001037141112",
    creditCardExpDate: "05/2027",
    creditCardCvv: "123",
  };
  await accountService.deposit(inputDeposit);
  await accountService.deposit(inputDeposit);
  const outputGetAccount = await accountService.getAccount(
    outputSignup.accountId,
  );

  expect(outputGetAccount.balances[0]?.assetId).toEqual("USD");
  expect(outputGetAccount.balances[0]?.quantity).toEqual(200);
});

test("Deve fazer um depósito em uma conta com stub", async () => {
  const accountData = new AccountDataDataBase();
  const accountService = new AccountServiceImpl(accountData);

  const upsertStub = sinon.stub(BalanceData.prototype, "upsert").resolves();
  const listByAccountIdStub = sinon
    .stub(BalanceData.prototype, "listByAccountId")
    .resolves([
      {
        accountId: "1",
        assetId: "USD",
        quantity: 100,
      },
    ]);

  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await accountService.signUp(inputSignup);
  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 100,
    creditCardHolderName: "John Doe",
    creditCardNumber: "4012001037141112",
    creditCardExpDate: "05/2027",
    creditCardCvv: "123",
  };
  await accountService.deposit(inputDeposit);
  const outputGetAccount = await accountService.getAccount(
    outputSignup.accountId,
  );

  expect(outputGetAccount.balances[0]?.assetId).toEqual("USD");
  expect(outputGetAccount.balances[0]?.quantity).toEqual(100);

  upsertStub.restore();
  listByAccountIdStub.restore();
});

test("Deve fazer um depósito em uma conta spy", async () => {
  const accountData = new AccountDataDataBase();
  const accountService = new AccountServiceImpl(accountData);

  const processTransactionSpy = sinon.spy(
    PaymentGatewayHttp.prototype,
    "processTransaction",
  );

  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  const outputSignup = await accountService.signUp(inputSignup);
  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 100,
    creditCardHolderName: "John Doe",
    creditCardNumber: "4012001037141112",
    creditCardExpDate: "05/2027",
    creditCardCvv: "123",
  };
  await accountService.deposit(inputDeposit);
  const outputGetAccount = await accountService.getAccount(
    outputSignup.accountId,
  );

  expect(outputGetAccount.balances[0]?.assetId).toEqual("USD");
  expect(outputGetAccount.balances[0]?.quantity).toEqual(100);
  expect(processTransactionSpy.calledOnce).toBeTruthy();
  expect(
    processTransactionSpy.calledWith({
      creditCardHolder: inputDeposit.creditCardHolderName,
      creditCardNumber: inputDeposit.creditCardNumber,
      creditCardExpDate: inputDeposit.creditCardExpDate,
      creditCardCvv: inputDeposit.creditCardCvv,
      amount: inputDeposit.quantity,
    }),
  ).toBeTruthy();

  processTransactionSpy.restore();
});
