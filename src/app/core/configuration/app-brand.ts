export const APP_BRAND = {
  name: 'GDC 3.0',
  businessName: 'Gutta Dental Clinic',
  tagline: 'A calm, reliable offline workspace for your clinic team.',
  primary: '#0e3b43',
  secondary: '#d99a3d',
  applicationCode: 'GDC',
  enabledModules: ['home', 'patients', 'appointments', 'treatments', 'payments', 'pharmacy'] as const
};

export type ModuleKey = typeof APP_BRAND.enabledModules[number];
