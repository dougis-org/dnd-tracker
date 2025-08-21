/**
 * Test suite for initial project setup validation
 * Following TDD approach - these tests should fail initially
 */

import { existsSync } from 'fs';
import path from 'path';
import packageJson from '@/../package.json';
import tsconfig from '@/../tsconfig.json';

describe('Project Setup', () => {
  describe('Next.js Configuration', () => {
    test('should have package.json with Next.js 15', () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      expect(existsSync(packageJsonPath)).toBe(true);
      
      expect(packageJson.dependencies.next).toMatch(/^15\./);
      expect(packageJson.dependencies.react).toBeDefined();
      expect(packageJson.dependencies['react-dom']).toBeDefined();
    });

    test('should have TypeScript configuration', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      expect(existsSync(tsconfigPath)).toBe(true);
      
      expect(tsconfig.compilerOptions.strict).toBe(true);
      expect(tsconfig.compilerOptions.paths).toBeDefined();
      expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['./src/*']);
    });

    test('should have proper folder structure', () => {
      const expectedFolders = [
        'src/app',
        'src/components', 
        'src/lib',
        'src/hooks',
        'src/models',
        'src/types',
        'src/styles'
      ];
      
      expectedFolders.forEach(folder => {
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

    test('should have package manager configuration for pnpm', () => {
      expect(packageJson.packageManager).toMatch(/pnpm@/);
    });
  });

  describe('Path Aliases', () => {
    test('should support path alias imports', () => {
      // This test will be implemented once we have actual components
      // For now, just verify the tsconfig has the right structure
      const paths = tsconfig.compilerOptions.paths;
      
      expect(paths['@/components/*']).toEqual(['./src/components/*']);
      expect(paths['@/lib/*']).toEqual(['./src/lib/*']);
      expect(paths['@/hooks/*']).toEqual(['./src/hooks/*']);
      expect(paths['@/models/*']).toEqual(['./src/models/*']);
      expect(paths['@/types/*']).toEqual(['./src/types/*']);
    });
  });
});