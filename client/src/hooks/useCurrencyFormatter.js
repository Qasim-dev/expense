import { useMemo, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';

const localeMap = {
  PKR: 'en-PK',
  INR: 'en-IN',
};

const buildFormatter = (currency, options = {}) =>
  new Intl.NumberFormat(localeMap[currency] || 'en', {
    style: 'currency',
    currencyDisplay: 'narrowSymbol',
    currency,
    maximumFractionDigits: 2,
    ...options,
  });

export const useCurrencyFormatter = () => {
  const currency = useAppSelector((state) => state.currency?.selected || 'PKR');

  const defaultFormatter = useMemo(() => buildFormatter(currency), [currency]);
  const wholeFormatter = useMemo(
    () =>
      buildFormatter(currency, {
        maximumFractionDigits: 0,
      }),
    [currency]
  );
  const compactFormatter = useMemo(
    () =>
      buildFormatter(currency, {
        maximumFractionDigits: 1,
        notation: 'compact',
      }),
    [currency]
  );

  const format = useCallback(
    (value, options) => {
      if (!options) {
        return defaultFormatter.format(Number(value || 0));
      }
      return buildFormatter(currency, options).format(Number(value || 0));
    },
    [currency, defaultFormatter]
  );

  return {
    currency,
    format,
    formatWhole: (value) => wholeFormatter.format(Number(value || 0)),
    formatCompact: (value) => compactFormatter.format(Number(value || 0)),
  };
};
