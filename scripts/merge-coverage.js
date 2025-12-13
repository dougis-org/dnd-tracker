#!/usr/bin/env node
/**
 * Merge coverage reports from unit and integration tests
 * This script combines coverage-final.json files from separate Jest runs
 * so that Codacy receives merged coverage data
 * 
 * Strategy: For each file, use unit test coverage as primary.
 * For files only tested in integration, use integration coverage.
 * This avoids dragging down overall metrics from sparse integration coverage.
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

  // Merge coverage data: unit coverage is primary
  // Only add files from integration coverage that aren't in unit coverage
  const merged = { ...unitCoverage };
  let filesOnlyInIntegration = 0;

  for (const filePath in integrationCoverage) {
    if (!merged[filePath]) {
      // File only in integration coverage - add it
      merged[filePath] = integrationCoverage[filePath];
      filesOnlyInIntegration++;
    }
    // For files in both, we keep unit coverage (which is more comprehensive)
  }

  // Write merged coverage
  fs.writeFileSync(unitCoverageFile, JSON.stringify(merged, null, 2));
  console.log('✅ Coverage reports merged successfully');
  console.log(`   Unit coverage (primary): ${Object.keys(unitCoverage).length} files`);
  console.log(`   Integration-only files added: ${filesOnlyInIntegration}`);
  console.log(`   Total merged coverage: ${Object.keys(merged).length} files`);
  console.log(`   Written to: ${unitCoverageFile}`);
} catch (error) {
  console.error('Failed to merge coverage reports:', error.message);
  process.exit(1);
}
