import { AccountDataDataBase } from "./AccountData.ts";
import { AccountServiceImpl } from "./AccountService.ts";
import API from "./api.ts";

const accountData = new AccountDataDataBase();
const accountService = new AccountServiceImpl(accountData);
new API(accountService);
