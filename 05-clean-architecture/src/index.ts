import { AccountRepositoryDatabase } from "./AccountRepository.ts";
import { AccountServiceImpl } from "./AccountService.ts";
import API from "./api.ts";
import { BalanceDAODatabase } from "./BalanceDAO.ts";
import { PaymentGatewayHttp } from "./PaymentGateway.ts";

const accountRepository = new AccountRepositoryDatabase();
const balanceDAO = new BalanceDAODatabase();
const paymentGateway = new PaymentGatewayHttp();
const accountService = new AccountServiceImpl(
  accountRepository,
  balanceDAO,
  paymentGateway,
);

new API(accountService);
