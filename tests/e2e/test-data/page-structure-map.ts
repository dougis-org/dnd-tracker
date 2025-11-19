/**
 * Page Structure Map
 *
 * Defines expected elements, selectors, and content for E2E tests.
 * When page content changes, update this map instead of individual tests.
 * Tests iterate over this map to validate pages work as expected.
 */

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'checkbox' | 'select' | 'textarea';
  required?: boolean;
  label?: string;
  selector?: string; // Custom selector if name attribute differs
  minLength?: number;
  maxLength?: number;
}

export interface PageStructure {
  path: string;
  heading?: string | RegExp;
  heading_level?: number;
  expectedText?: (string | RegExp)[];
  formFields?: FormField[];
  buttons?: string[];
  sections?: string[];
  ariaLabels?: string[];
  selects?: { name: string; minOptions: number }[];
  checkboxes?: string[];
}

export const PAGE_STRUCTURES: Record<string, PageStructure> = {
  profile: {
    path: '/profile',
    heading: /profile|settings/i,
    expectedText: [/profile|settings/i],
    formFields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        label: 'Name',
        maxLength: 100,
      },
      {
        name: 'email',
        type: 'email',
        required: true,
        label: 'Email',
      },
    ],
    buttons: ['Save', 'Save Changes'],
  },

  settings: {
    path: '/settings',
    heading: /settings/i,
    expectedText: [/settings/i],
    sections: ['Account', 'Preferences', 'Notifications'],
    selects: [{ name: 'theme', minOptions: 2 }],
    checkboxes: [
      'Email notifications',
      'Push notifications',
      'Marketing emails',
    ],
    buttons: ['Save', 'Save Settings'],
  },

  subscription: {
    path: '/subscription',
    heading: /subscription|billing/i,
    heading_level: 1,
    expectedText: [/subscription|billing/i, /plan|pricing/i],
    sections: ['Plans', 'Payment', 'Billing History'],
    buttons: ['Subscribe', 'Upgrade', 'Manage Subscription'],
  },

  landing: {
    path: '/',
    heading: /d&d tracker|master your campaigns/i,
    expectedText: [/d&d tracker/i, /campaign/i],
    sections: [
      'Hero',
      'Features',
      'Interactive Demo',
      'Testimonials',
      'Pricing',
    ],
    ariaLabels: [
      'Hero',
      'Features',
      'Interactive Demo',
      'Testimonials',
      'Pricing',
    ],
    buttons: ['Start Free', 'Learn More'],
  },

  encounterCreate: {
    path: '/encounters/new',
    heading: /create.*encounter|new encounter/i,
    heading_level: 1,
    formFields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        label: 'Encounter Name',
      },
    ],
    buttons: ['Add Participant', 'Save', 'Create'],
  },

  itemCatalog: {
    path: '/items',
    heading: /item catalog/i,
    heading_level: 1,
    expectedText: [/item catalog/i, /search/i],
    formFields: [
      {
        name: 'search',
        type: 'text',
        label: 'Search items',
        selector: '[placeholder*="Search items"]',
      },
    ],
    selects: [
      { name: 'category', minOptions: 2 },
      { name: 'rarity', minOptions: 2 },
    ],
  },

  navigation: {
    path: '/',
    heading: /d&d tracker/i,
    expectedText: [/help|home|collections/i],
    buttons: ['Help', 'Collections', 'Sign In'],
    sections: ['Primary Navigation', 'Mobile Navigation'],
  },

  offlineDemo: {
    path: '/offline-demo',
    heading: /offline/i,
    expectedText: [/offline|sync/i],
    buttons: ['Retry'],
  },
};

export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  invalidEmail: 'invalid-email',
  longName: 'A'.repeat(101),
  validName: 'Test Character',
};

export function getPageStructure(pageName: string): PageStructure {
  const structure = PAGE_STRUCTURES[pageName];
  if (!structure) {
    throw new Error(
      `Page structure not found for "${pageName}". Available: ${Object.keys(PAGE_STRUCTURES).join(', ')}`
    );
  }
  return structure;
}

export function findFormField(
  structure: PageStructure,
  fieldName: string
): FormField | undefined {
  return structure.formFields?.find(
    (f) => f.name === fieldName || f.selector?.includes(fieldName)
  );
}
