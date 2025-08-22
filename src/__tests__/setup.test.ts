/**
 * Test suite for initial project setup validation
 * Following TDD approach - these tests should fail initially
 */

import { existsSync, readFileSync } from 'fs';
import path from 'path';

// Predefined safe folder names to prevent path traversal
const ALLOWED_FOLDERS = [
  'src/app',
  'src/components', 
  'src/lib',
  'src/hooks',
  'src/models',
  'src/types',
  'src/styles'
];

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));

describe('Project Setup', () => {
  describe('Next.js Configuration', () => {
    test('should have package.json with Next.js 15', () => {
      expect(existsSync(packageJsonPath)).toBe(true);
      
      expect(packageJson.dependencies.next).toMatch(/^15\./);
      expect(packageJson.dependencies.react).toBeDefined();
      expect(packageJson.dependencies['react-dom']).toBeDefined();
    });

    test('should have TypeScript configuration', () => {
      expect(existsSync(tsconfigPath)).toBe(true);
      
      expect(tsconfig.compilerOptions.strict).toBe(true);
      expect(tsconfig.compilerOptions.paths).toBeDefined();
      expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['./src/*']);
    });

    test('should have proper folder structure', () => {
      ALLOWED_FOLDERS.forEach(folder => {
        const folderPath = path.join(process.cwd(), folder);
        expect(existsSync(folderPath)).toBe(true);
      });
    });
  });

  describe('Development Tools', () => {
    test('should have ESLint configuration', () => {
      const eslintPath = path.join(process.cwd(), '.eslintrc.json');
      expect(existsSync(eslintPath)).toBe(true);
    });

    test('should not have package manager configuration (uses npm by default)', () => {
      expect(packageJson.packageManager).toBeUndefined();
    });
  });

  describe('Path Aliases', () => {
    test('should support path alias imports', () => {
      // This test will be implemented once we have actual components
      // For now, just verify the tsconfig has the right structure
      const paths = tsconfig.compilerOptions.paths;
      
      expect(paths['@/*']).toEqual(['./src/*']);
      expect(paths['@/../*']).toEqual(['./*']);
    });
  });
});