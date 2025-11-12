/**
 * Reusable test patterns to eliminate duplication while maintaining coverage
 */

import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Test pattern: Input validation with error display
 * Tests that invalid input shows specific error message
 */
export const testInputValidationError = async (
  label: string,
  inputPlaceholder: string,
  buttonName: string,
  invalidValue: string,
  expectedError: RegExp,
) => {
  const user = userEvent.setup();
  const input = screen.getByPlaceholderText(inputPlaceholder);
  const button = screen.getByRole('button', { name: buttonName });

  await user.type(input, invalidValue);
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(expectedError)).toBeInTheDocument();
  });
};

/**
 * Test pattern: Input submission with callback
 * Tests that valid input triggers callback with correct value
 */
export const testInputSubmission = async (
  inputPlaceholder: string,
  buttonName: string,
  inputValue: string,
  expectedCallback: jest.Mock,
  expectedCallValue: number | string,
) => {
  const user = userEvent.setup();
  const input = screen.getByPlaceholderText(inputPlaceholder);
  const button = screen.getByRole('button', { name: buttonName });

  await user.type(input, inputValue);
  fireEvent.click(button);

  await waitFor(() => {
    expect(expectedCallback).toHaveBeenCalledWith(expectedCallValue);
  });
};

/**
 * Test pattern: Input submission with cleanup
 * Tests that input clears after submission
 */
export const testInputClearsAfterSubmission = async (
  inputPlaceholder: string,
  buttonName: string,
  inputValue: string,
) => {
  const user = userEvent.setup();
  const input = screen.getByPlaceholderText(inputPlaceholder) as HTMLInputElement;
  const button = screen.getByRole('button', { name: buttonName });

  await user.type(input, inputValue);
  fireEvent.click(button);

  await waitFor(() => {
    expect(input.value).toBe('');
  });
};

/**
 * Test pattern: Submit with success message
 * Tests that submission shows success/feedback message
 */
export const testSubmissionShowsMessage = async (
  inputPlaceholder: string,
  buttonName: string,
  inputValue: string,
  expectedMessage: RegExp,
) => {
  const user = userEvent.setup();
  const input = screen.getByPlaceholderText(inputPlaceholder);
  const button = screen.getByRole('button', { name: buttonName });

  await user.type(input, inputValue);
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(expectedMessage)).toBeInTheDocument();
  });
};

/**
 * Test pattern: Button disabled state
 * Tests that button is disabled when input empty
 */
export const testButtonDisabledWhenEmpty = (buttonName: string) => {
  const button = screen.getByRole('button', { name: buttonName });
  expect(button).toBeDisabled();
};

/**
 * Test pattern: Button enabled state
 * Tests that button enables with valid input
 */
export const testButtonEnabledWithInput = async (
  inputPlaceholder: string,
  buttonName: string,
  inputValue: string,
) => {
  const user = userEvent.setup();
  const input = screen.getByPlaceholderText(inputPlaceholder);
  const button = screen.getByRole('button', { name: buttonName });

  await user.type(input, inputValue);

  expect(button).toBeEnabled();
};

/**
 * Test pattern: Component renders with text
 * Verifies text content appears in document
 */
export const testRendersText = (text: string | RegExp) => {
  const element = typeof text === 'string' ? screen.getByText(text) : screen.getByText(text);
  expect(element).toBeInTheDocument();
};

/**
 * Test pattern: Component renders element by role
 * Verifies element exists with specific role
 */
export const testRendersElement = (role: string, options?: Record<string, unknown>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = screen.getByRole(role as any, options);
  expect(element).toBeInTheDocument();
};

/**
 * Test pattern: Element has CSS classes
 * Verifies styling applied correctly
 */
export const testElementHasClasses = (testId: string, classes: string[]) => {
  const element = screen.getByTestId(testId);
  classes.forEach((cls) => {
    expect(element).toHaveClass(cls);
  });
};

/**
 * Test pattern: Element has accessibility attribute
 * Verifies aria-label or aria-* present on input element
 */
export const testAccessibilityAttribute = (selector: RegExp | string, attr: string) => {
  // All calls should be for input elements, so always use getByPlaceholderText
  const element = screen.getByPlaceholderText(selector);
  expect(element).toHaveAttribute(attr);
};
