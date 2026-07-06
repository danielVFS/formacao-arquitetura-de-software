import pgp from "pg-promise";

const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

export async function save(account: Account): Promise<void> {
  await connection.query(
    "INSERT INTO app.account (account_id, name, email, document, password) VALUES ($1, $2, $3, $4, $5)",
    [
      account.accountId,
      account.name,
      account.email,
      account.document,
      account.password,
    ],
  );
}

export async function getById(accountId: string): Promise<Account> {
  const [accountData] = await connection.query(
    "SELECT * FROM app.account WHERE account_id = $1",
    [accountId],
  );
  const account = {
    accountId: accountData.account_id,
    name: accountData.name,
    email: accountData.email,
    document: accountData.document,
    password: accountData.password,
  };
  return account;
}

type Account = {
  accountId: string;
  name: string;
  email: string;
  document: string;
  password: string;
};
