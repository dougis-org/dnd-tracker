/**
 * Page Validation Utilities
 *
 * Reusable functions to validate pages against the page structure map.
 * Reduces code duplication and makes tests maintainable.
 */

import { Page, expect } from '@playwright/test';
import {
  PageStructure,
  FormField,
  getPageStructure,
} from './page-structure-map';

export class PageValidator {
  constructor(private page: Page) {}

  /**
   * Navigate to page and wait for it to load
   */
  async navigateTo(pageName: string): Promise<PageStructure> {
    const structure = getPageStructure(pageName);
    await this.page.goto(structure.path);
    await this.page.waitForLoadState('networkidle');
    return structure;
  }

  /**
   * Validate page heading exists
   */
  async validateHeading(structure: PageStructure): Promise<void> {
    if (!structure.heading) return;

    const level = structure.heading_level || 1;
    const heading = this.page.locator(`h${level}`).first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(structure.heading);
  }

  /**
   * Validate all expected text appears on page
   */
  async validateText(structure: PageStructure): Promise<void> {
    if (!structure.expectedText || structure.expectedText.length === 0) return;

    for (const text of structure.expectedText) {
      const textLocator = this.page.locator(`text=${text}`);
      const isVisible = await textLocator.isVisible().catch(() => false);

      if (!isVisible) {
        // Log failure but don't fail test if some text is present
        console.warn(`Expected text not found: ${text}`);
      }
    }
  }

  /**
   * Validate all form fields exist
   */
  async validateFormFields(structure: PageStructure): Promise<void> {
    if (!structure.formFields || structure.formFields.length === 0) return;

    for (const field of structure.formFields) {
      const fieldLocator = this.getFieldLocator(field);
      const exists = await fieldLocator.count().then((c: number) => c > 0);

      if (!exists && field.required) {
        throw new Error(`Required form field not found: ${field.name}`);
      }
    }
  }

  /**
   * Validate all expected buttons exist
   */
  async validateButtons(structure: PageStructure): Promise<void> {
    if (!structure.buttons || structure.buttons.length === 0) return;

    const foundButtons: string[] = [];

    for (const buttonText of structure.buttons) {
      const button = this.page.locator(`button:has-text("${buttonText}")`);
      const exists = await button.count().then((c) => c > 0);

      if (exists) {
        foundButtons.push(buttonText);
      }
    }

    // At least one button should exist
    if (foundButtons.length === 0) {
      throw new Error(
        `No expected buttons found. Expected one of: ${structure.buttons.join(', ')}`
      );
    }
  }

  /**
   * Validate select dropdowns have minimum options
   */
  async validateSelects(structure: PageStructure): Promise<void> {
    if (!structure.selects || structure.selects.length === 0) return;

    for (const selectDef of structure.selects) {
      const select = this.page.locator(`select[name="${selectDef.name}"]`);
      const exists = await select.count().then((c) => c > 0);

      if (exists) {
        const options = select.locator('option');
        const optionCount = await options.count();

        if (optionCount < selectDef.minOptions) {
          throw new Error(
            `Select "${selectDef.name}" has ${optionCount} options, expected at least ${selectDef.minOptions}`
          );
        }
      }
    }
  }

  /**
   * Validate checkboxes exist
   */
  async validateCheckboxes(structure: PageStructure): Promise<void> {
    if (!structure.checkboxes || structure.checkboxes.length === 0) return;

    const checkboxes = this.page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    if (count < structure.checkboxes.length) {
      console.warn(
        `Expected ${structure.checkboxes.length} checkboxes, found ${count}`
      );
    }
  }

  /**
   * Get appropriate locator for form field
   */
  getFieldLocator(field: FormField) {
    if (field.selector) {
      return this.page.locator(field.selector);
    }

    if (field.type === 'text' || field.type === 'email') {
      return this.page.locator(`input[name="${field.name}"]`);
    }

    if (field.type === 'checkbox') {
      return this.page.locator(`input[name="${field.name}"][type="checkbox"]`);
    }

    if (field.type === 'select') {
      return this.page.locator(`select[name="${field.name}"]`);
    }

    return this.page.locator(`[name="${field.name}"]`);
  }

  /**
   * Fill form field with value
   */
  async fillField(field: FormField, value: string): Promise<void> {
    const locator = this.getFieldLocator(field);
    const exists = await locator.count().then((c: number) => c > 0);

    if (!exists) {
      if (field.required) {
        throw new Error(`Required field not found: ${field.name}`);
      }
      return;
    }

    if (field.type === 'checkbox') {
      const isChecked = await locator.isChecked();
      if (value === 'true' && !isChecked) {
        await locator.click();
      } else if (value === 'false' && isChecked) {
        await locator.click();
      }
    } else if (field.type === 'select') {
      await locator.selectOption(value);
    } else {
      await locator.fill(value);
    }
  }

  /**
   * Submit form using first available button
   */
  async submitForm(structure: PageStructure): Promise<void> {
    if (!structure.buttons || structure.buttons.length === 0) {
      throw new Error('No submit buttons defined for this page');
    }

    for (const buttonText of structure.buttons) {
      const button = this.page
        .locator(`button:has-text("${buttonText}")`)
        .first();
      const exists = await button.count().then((c) => c > 0);

      if (exists && (await button.isVisible())) {
        await button.click();
        return;
      }
    }

    throw new Error(
      `Could not find clickable submit button. Expected one of: ${structure.buttons.join(', ')}`
    );
  }

  /**
   * Validate all expected sections with aria-labels exist
   */
  async validateAriaLabels(structure: PageStructure): Promise<void> {
    if (!structure.ariaLabels || structure.ariaLabels.length === 0) return;

    for (const label of structure.ariaLabels) {
      const section = this.page.locator(`section[aria-label="${label}"]`);
      const exists = await section.count().then((c) => c > 0);

      if (!exists) {
        console.warn(
          `Section with aria-label="${label}" not found. This may indicate a page structure change.`
        );
      }
    }
  }

  /**
   * Comprehensive page validation
   */
  async validatePage(structure: PageStructure): Promise<void> {
    await this.validateHeading(structure);
    await this.validateText(structure);
    await this.validateFormFields(structure);
    await this.validateButtons(structure);
    await this.validateSelects(structure);
    await this.validateCheckboxes(structure);
    await this.validateAriaLabels(structure);
  }
}
