import { getCountryCode, getLocale, getTimezone } from "@solomonai/location";

import { currencies } from "@solomonai/location/currencies";

export type Settings = {
  currency: string;
  size: string;
  include_tax: boolean;
  include_vat: boolean;
  include_discount: boolean;
  include_decimals: boolean;
  include_units: boolean;
  include_qr: boolean;
  timezone: string;
  locale: string;
};

export async function getDefaultSettings(
  user: {
    team: {
      base_currency: string;
    };
    timezone: string;
    locale: string;
  },
): Promise<Settings> {
  const countryCode = await getCountryCode();

  const currency =
    user.team?.base_currency ??
    currencies[countryCode as keyof typeof currencies] ??
    "USD";

  const timezone = user.timezone ?? getTimezone();
  const locale = user.locale ?? getLocale();

  // Default to letter size for US/CA, A4 for rest of world
  const size = ["US", "CA"].includes(countryCode) ? "letter" : "a4";

  // Default to include sales tax for countries where it's common
  const include_tax = ["US", "CA", "AU", "NZ", "SG", "MY", "IN"].includes(
    countryCode,
  );

  return {
    currency: currency.toUpperCase(),
    size,
    include_tax,
    include_vat: !include_tax,
    include_discount: false,
    include_decimals: false,
    include_units: false,
    include_qr: true,
    timezone,
    locale,
  };
}
