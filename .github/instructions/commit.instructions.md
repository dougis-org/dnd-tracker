# Commit rules

## Before you commit

- Always review your changes before committing.
- Run all tests, builds and linters to ensure code quality.
- Ensure your code follows the project's coding standards.
- Follow all guidelines in this document.

## Message structure

- Use a single line for the subject (max 50 characters).
- Separate subject from body with a blank line.
- Use the body to explain what and why vs. how. Wrap lines at 72 characters.
- Use the footer for any references (e.g., issues, PRs).
- Use the imperative mood in the subject line (e.g., "fix", "add", "change").
- Use semantic prefixes in the subject line (e.g., "fix:", "feat:", "chore:").

## Content guidelines

- Be concise but descriptive. Provide enough context to understand the change.
- Reference related issues or PRs in the footer (e.g., "Fixes #123").
- Avoid vague terms like "update", "fix", or "change" without context.
- Use consistent tense (preferably present tense) throughout the message.
- Ensure the message accurately reflects the changes made in the commit.

## Signing commits

- Sign **all** commits with the user's GPG key (e.g., `git commit -S`).
- If signing fails, use an interactive command line to ask the user for assistance.
