/**
 * Parameters for calculating an account balance in the base currency
 * @interface GetAccountBalanceParams
 */
type GetAccountBalanceParams = {
  /** The currency code of the account */
  currency: string;
  /** The original balance in the account's currency */
  balance: number;
  /** The base currency code to convert to */
  baseCurrency: string;
  /** The exchange rate from account currency to base currency (null if unavailable) */
  rate: number | null;
};

/**
 * Converts an account balance from its original currency to the base currency
 * 
 * @param {GetAccountBalanceParams} params - The parameters for the conversion
 * @returns {number} The balance converted to the base currency, rounded to 2 decimal places
 * 
 * @example
 * // Returns 150.00 if the rate is 1.5
 * getAccountBalance({
 *   currency: 'EUR',
 *   balance: 100,
 *   baseCurrency: 'USD',
 *   rate: 1.5
 * });
 */
export function getAccountBalance({
  currency,
  balance,
  baseCurrency,
  rate,
}: GetAccountBalanceParams) {
  if (currency === baseCurrency) {
    return balance;
  }

  return +(balance * (rate ?? 1)).toFixed(2);
}

/**
 * Parameters for calculating a transaction amount in the base currency
 * @interface GetTransactionAmountParams
 */
type GetTransactionAmountParams = {
  /** The original transaction amount in the transaction's currency */
  amount: number;
  /** The currency code of the transaction */
  currency: string;
  /** The base currency code to convert to */
  baseCurrency: string;
  /** The exchange rate from transaction currency to base currency (null if unavailable) */
  rate: number | null;
};

/**
 * Converts a transaction amount from its original currency to the base currency
 * 
 * @param {GetTransactionAmountParams} params - The parameters for the conversion
 * @returns {number} The amount converted to the base currency, rounded to 2 decimal places
 * 
 * @example
 * // Returns 75.00 if the rate is 1.5
 * getTransactionAmount({
 *   amount: 50,
 *   currency: 'EUR',
 *   baseCurrency: 'USD',
 *   rate: 1.5
 * });
 */
export function getTransactionAmount({
  amount,
  currency,
  baseCurrency,
  rate,
}: GetTransactionAmountParams) {
  if (currency === baseCurrency) {
    return amount;
  }

  return +(amount * (rate ?? 1)).toFixed(2);
}
