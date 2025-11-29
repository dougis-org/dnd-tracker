#!/usr/bin/env bash
set -euo pipefail
export TZ=UTC
export CI=true
cd "$(dirname "$0")/.."
# Run CI tests in band to reduce resource contention
npm run test:ci -- --runInBand --silent --maxWorkers=50%
