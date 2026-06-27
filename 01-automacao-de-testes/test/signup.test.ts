import { expect, test } from "vitest";

test("Deve criar uma conta", async () => {
  const input = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const responseSignup = await fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const outputSignup = await responseSignup.json();

  expect(outputSignup.accountId).toBeDefined();

  const responseGetAccount = await fetch(
    `http://localhost:3000/accounts/${outputSignup.accountId}`,
  );

  const outputGetAccount = await responseGetAccount.json();

  expect(outputGetAccount.accountId).toBe(outputSignup.accountId);
  expect(outputGetAccount.name).toBe(input.name);
  expect(outputGetAccount.email).toBe(input.email);
  expect(outputGetAccount.document).toBe(input.document);
  expect(outputGetAccount.password).toBe(input.password);
});
