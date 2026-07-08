import pgp from "pg-promise";

export default class BalanceData {
  async upsert(balance: Balance): Promise<void> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
      "INSERT INTO app.balance (account_id, asset_id, quantity) VALUES ($1, $2, $3) on conflict (account_id, asset_id) do update set quantity = excluded.quantity",
      [balance.accountId, balance.assetId, balance.quantity],
    );
    await connection.$pool.end();
  }

  async listByAccountId(accountId: string): Promise<Balance[]> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const balances = await connection.query(
      "SELECT * FROM app.balance WHERE account_id = $1",
      [accountId],
    );
    const balancesData = balances.map((balance: any) => ({
      accountId: balance.account_id,
      assetId: balance.asset_id,
      quantity: parseFloat(balance.quantity),
    }));
    await connection.$pool.end();
    return balancesData;
  }
}

type Balance = {
  accountId: string;
  assetId: string;
  quantity: number;
};
