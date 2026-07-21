import { expect, test } from "vitest";
import Account, { type Balance } from "../../src/domain/Account.ts";

test("Deve criar uma conta", () => {
  const account = Account.create(
    "John Doe",
    "john.doe@gmail.com",
    "97456321558",
    "asdQWE123",
  );

  expect(account).toBeDefined();
  expect(account.accountId).toBeDefined();
  expect(account.getName()).toBe("John Doe");
  expect(account.email).toBe("john.doe@gmail.com");
  expect(account.document).toBe("97456321558");
  expect(account.password).toBe("asdQWE123");
  expect(account.balances).toEqual([]);
});

test("Deve restaurar o estado de  uma conta", () => {
  const accountId = crypto.randomUUID();
  const balances: Balance[] = [];
  const account = new Account(
    accountId,
    "John Doe",
    "john.doe@gmail.com",
    "97456321558",
    "asdQWE123",
    balances,
  );

  expect(account).toBeDefined();
  expect(account.accountId).toBeDefined();
  expect(account.getName()).toBe("John Doe");
  expect(account.email).toBe("john.doe@gmail.com");
  expect(account.document).toBe("97456321558");
  expect(account.password).toBe("asdQWE123");
  expect(account.balances).toEqual([]);
});

test("Não deve criar uma conta com nome inválido", () => {
  expect(() => {
    Account.create("John", "john.doe@gmail.com", "97456321558", "asdQWE123");
  }).toThrow(new Error("Invalid name"));
});

test("Não deve criar uma conta com email inválido", () => {
  expect(() => {
    Account.create("John Doe", "john.doe", "97456321558", "asdQWE123");
  }).toThrow(new Error("Invalid email"));
});

test("Não deve criar uma conta com documento inválido", () => {
  expect(() => {
    Account.create(
      "John Doe",
      "john.doe@gmail.com",
      "12345678900",
      "asdQWE123",
    );
  }).toThrow(new Error("Invalid document"));
});

test("Não deve criar uma conta com senha inválida", () => {
  expect(() => {
    Account.create("John Doe", "john.doe@gmail.com", "97456321558", "123");
  }).toThrow(new Error("Invalid password"));
});

test("Deve depositar em uma conta", () => {
  const account = Account.create(
    "John Doe",
    "john.doe@gmail.com",
    "97456321558",
    "asdQWE123",
  );
  account.deposit("USD", 1000);
  expect(account.getBalance("USD")).toBe(1000);
});

test("Deve fazer 2 depósitos em uma conta", () => {
  const account = Account.create(
    "John Doe",
    "john.doe@gmail.com",
    "97456321558",
    "asdQWE123",
  );
  account.deposit("USD", 1000);
  account.deposit("USD", 500);
  expect(account.getBalance("USD")).toBe(1500);
});

test("Deve fazer 1 saque em uma conta", () => {
  const account = Account.create(
    "John Doe",
    "john.doe@gmail.com",
    "97456321558",
    "asdQWE123",
  );
  account.deposit("USD", 1000);
  account.withdraw("USD", 500);
  expect(account.getBalance("USD")).toBe(500);
});

test("Não deve fazer um saque de uma conta sem saldo suficiente", () => {
  const account = Account.create(
    "John Doe",
    "john.doe@gmail.com",
    "97456321558",
    "asdQWE123",
  );
  account.deposit("USD", 1000);
  expect(() => account.withdraw("USD", 1500)).toThrow(
    new Error("Out of balance"),
  );
});
