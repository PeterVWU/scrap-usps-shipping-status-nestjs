#!/bin/bash
# Install dependencies
npm install

# Ensure nest CLI is available
npm install -g @nestjs/cli

# Install chrome for puppeteer
npx puppeteer browsers install chrome

# Run the build
npm run build