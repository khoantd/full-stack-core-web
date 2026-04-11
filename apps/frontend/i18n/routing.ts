import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'vi'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // We keep the current filesystem routing (no `[locale]` segment)
  // and let next-intl rewrite locale-prefixed URLs to these internal paths.
  pathnames: {
    '/': '/',

    // Guest/auth
    '/login': '/login',
    '/register': '/register',
    '/forgot-password': '/forgot-password',
    '/reset-password': '/reset-password',

    // App
    '/dashboard': '/dashboard',
    '/dashboard/users': '/dashboard/users',
    '/dashboard/blogs': '/dashboard/blogs',
    '/dashboard/services': '/dashboard/services',
    '/dashboard/service-categories': '/dashboard/service-categories',
    '/dashboard/events': '/dashboard/events',
    '/dashboard/events/[id]/attendees': '/dashboard/events/[id]/attendees',
    '/dashboard/media': '/dashboard/media',
    '/dashboard/pricings': '/dashboard/pricings',
    '/dashboard/faq-sections': '/dashboard/faq-sections',
    '/dashboard/testimonial-sections': '/dashboard/testimonial-sections',
    '/dashboard/category-products': '/dashboard/category-products',
    '/dashboard/products': '/dashboard/products',
    '/dashboard/automakers': '/dashboard/automakers',
    '/dashboard/payments': '/dashboard/payments',
    '/dashboard/audit-logs': '/dashboard/audit-logs',

    // Settings
    '/dashboard/settings': '/dashboard/settings',
    '/dashboard/settings/features': '/dashboard/settings/features',
    '/dashboard/settings/organization': '/dashboard/settings/organization',
    '/dashboard/settings/profile': '/dashboard/settings/profile',
    '/dashboard/settings/account': '/dashboard/settings/account',
    '/dashboard/settings/api-keys': '/dashboard/settings/api-keys',
    '/dashboard/settings/bank-accounts': '/dashboard/settings/bank-accounts',

    // Other
    '/users': '/users'
  }
});

export type AppLocale = (typeof routing.locales)[number];
