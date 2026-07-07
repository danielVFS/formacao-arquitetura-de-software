import { expect, test } from "vitest";
import { AccountDataDataBase } from "../../src/AccountData.ts";
import { AccountServiceImpl } from "../../src/AccountService.ts";

test("Deve criar uma conta", async () => {
  const accountData = new AccountDataDataBase();
  const accountService = new AccountServiceImpl(accountData);

  const input = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const outputSignup = await accountService.signUpService(input);
  const outputGetAccount = await accountService.getAccountService(
    outputSignup.accountId,
  );

  expect(outputGetAccount.accountId).toBe(outputSignup.accountId);
  expect(outputGetAccount.name).toBe(input.name);
  expect(outputGetAccount.email).toBe(input.email);
  expect(outputGetAccount.document).toBe(input.document);
});
