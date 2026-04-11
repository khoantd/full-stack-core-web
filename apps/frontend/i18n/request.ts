import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {routing, type AppLocale} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = (requested || routing.defaultLocale) as AppLocale;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
