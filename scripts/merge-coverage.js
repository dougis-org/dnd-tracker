#!/usr/bin/env node
/**
 * Merge coverage reports from unit and integration tests
 * This script combines coverage-final.json files from separate Jest runs
 * so that Codacy receives merged coverage data
 */

const fs = require('fs');
const path = require('path');

const coverageDir = path.join(__dirname, '..', 'coverage');
const integrationCoverageDir = path.join(__dirname, '..', '.coverage-integration');

// Create directories if they don't exist
if (!fs.existsSync(coverageDir)) {
  fs.mkdirSync(coverageDir, { recursive: true });
}

// Read coverage files
const unitCoverageFile = path.join(coverageDir, 'coverage-final.json');
const integrationCoverageFile = path.join(integrationCoverageDir, 'coverage-final.json');

if (!fs.existsSync(unitCoverageFile)) {
  console.error('Unit test coverage file not found:', unitCoverageFile);
  process.exit(1);
}

if (!fs.existsSync(integrationCoverageFile)) {
  console.warn('Integration test coverage file not found:', integrationCoverageFile);
  console.warn('Using unit test coverage only');
  process.exit(0);
}

try {
  const unitCoverage = JSON.parse(fs.readFileSync(unitCoverageFile, 'utf8'));
  const integrationCoverage = JSON.parse(fs.readFileSync(integrationCoverageFile, 'utf8'));

  // Merge coverage data
  const merged = { ...unitCoverage };

  for (const filePath in integrationCoverage) {
    if (merged[filePath]) {
      // File exists in both - merge coverage data
      const unitFile = merged[filePath];
      const integrationFile = integrationCoverage[filePath];

      // Merge line coverage
      if (unitFile.l && integrationFile.l) {
        for (const lineNum in integrationFile.l) {
          if (unitFile.l[lineNum] !== undefined) {
            // Take the max count from either coverage run
            unitFile.l[lineNum] = Math.max(unitFile.l[lineNum], integrationFile.l[lineNum]);
          } else {
            unitFile.l[lineNum] = integrationFile.l[lineNum];
          }
        }
      }

      // Merge statement coverage
      if (unitFile.s && integrationFile.s) {
        for (const stmtNum in integrationFile.s) {
          if (unitFile.s[stmtNum] !== undefined) {
            unitFile.s[stmtNum] = Math.max(unitFile.s[stmtNum], integrationFile.s[stmtNum]);
          } else {
            unitFile.s[stmtNum] = integrationFile.s[stmtNum];
          }
        }
      }

      // Merge branch coverage
      if (unitFile.b && integrationFile.b) {
        for (const branchNum in integrationFile.b) {
          if (unitFile.b[branchNum] !== undefined) {
            // Branches are arrays - merge by taking max of each element
            for (let i = 0; i < integrationFile.b[branchNum].length; i++) {
              unitFile.b[branchNum][i] = Math.max(
                unitFile.b[branchNum][i] || 0,
                integrationFile.b[branchNum][i] || 0
              );
            }
          } else {
            unitFile.b[branchNum] = integrationFile.b[branchNum];
          }
        }
      }

      // Merge function coverage
      if (unitFile.f && integrationFile.f) {
        for (const funcNum in integrationFile.f) {
          if (unitFile.f[funcNum] !== undefined) {
            unitFile.f[funcNum] = Math.max(unitFile.f[funcNum], integrationFile.f[funcNum]);
          } else {
            unitFile.f[funcNum] = integrationFile.f[funcNum];
          }
        }
      }
    } else {
      // File only in integration coverage - add it
      merged[filePath] = integrationCoverage[filePath];
    }
  }

  // Write merged coverage
  fs.writeFileSync(unitCoverageFile, JSON.stringify(merged, null, 2));
  console.log('✅ Coverage reports merged successfully');
  console.log(`   Unit + Integration coverage written to ${unitCoverageFile}`);
} catch (error) {
  console.error('Failed to merge coverage reports:', error.message);
  process.exit(1);
}
