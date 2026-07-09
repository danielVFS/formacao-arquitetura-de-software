import pgp from "pg-promise";

export default interface BalanceDAO {
  upsert(balance: Balance): Promise<void>;
  listByAccountId(accountId: string): Promise<Balance[]>;
}
export class BalanceDAODatabase implements BalanceDAO {
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

export class BalanceDAOFake implements BalanceDAO {
  private balances: Balance[] = [];

  async upsert(balance: Balance): Promise<void> {
    const existingBalance = this.balances.find(
      (b) => b.accountId === balance.accountId && b.assetId === balance.assetId,
    );
    if (existingBalance) {
      existingBalance.quantity = balance.quantity;
    } else {
      this.balances.push(balance);
    }
  }

  async listByAccountId(accountId: string): Promise<Balance[]> {
    return this.balances.filter((balance) => balance.accountId === accountId);
  }
}

type Balance = {
  accountId: string;
  assetId: string;
  quantity: number;
};
