#!/usr/bin/env node
/**
 * Card Generator Script
 *
 * Creates a new dashboard card from templates.
 *
 * Usage:
 *   node scripts/create-card.js --name="MyCard" --title="My Card" --icon="Calendar"
 *
 * Options:
 *   --name     PascalCase card name (e.g., "UpcomingMeetings")
 *   --title    Display title (e.g., "Upcoming Meetings")
 *   --icon     Fluent UI icon name without "Regular" suffix (e.g., "Calendar")
 *   --no-large Skip creating the large card
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    acc[key] = value === undefined ? true : value;
  }
  return acc;
}, {});

// Validate required arguments
if (!args.name) {
  console.error('Error: --name is required');
  console.error('Usage: node scripts/create-card.js --name="MyCard" --title="My Card" --icon="Calendar"');
  process.exit(1);
}

// Derive names from input
const CardName = args.name;
const cardName = CardName.charAt(0).toLowerCase() + CardName.slice(1);
const CARD_NAME = CardName.replace(/([A-Z])/g, '_$1').toUpperCase().slice(1);
const CardTitle = args.title || CardName.replace(/([A-Z])/g, ' $1').trim();
const CardIcon = (args.icon || 'Document') + 'Regular';
const hasLarge = args['no-large'] !== true;

console.log('');
console.log('Creating new card:');
console.log(`  Name: ${CardName}`);
console.log(`  Title: ${CardTitle}`);
console.log(`  Icon: ${CardIcon}`);
console.log(`  Large card: ${hasLarge ? 'Yes' : 'No'}`);
console.log('');

// Paths
const baseDir = path.join(__dirname, '../src/webparts/dashboardCards');
const templatesDir = path.join(__dirname, '../card-templates');

// Template replacements
const replacements = {
  '{{CardName}}': CardName,
  '{{cardName}}': cardName,
  '{{CARD_NAME}}': CARD_NAME,
  '{{CardTitle}}': CardTitle,
  '{{CardIcon}}': CardIcon,
};

// Apply replacements to content
function applyReplacements(content) {
  let result = content;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.split(placeholder).join(value);
  }
  return result;
}

// Read template and apply replacements
function processTemplate(templateName) {
  const templatePath = path.join(templatesDir, templateName);
  const content = fs.readFileSync(templatePath, 'utf8');
  return applyReplacements(content);
}

// Create directory if it doesn't exist
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  Created directory: ${path.relative(baseDir, dirPath)}`);
  }
}

// Write file
function writeFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    console.log(`  Skipped (exists): ${path.relative(baseDir, filePath)}`);
    return false;
  }
  fs.writeFileSync(filePath, content);
  console.log(`  Created: ${path.relative(baseDir, filePath)}`);
  return true;
}

// Create model file
console.log('Creating models...');
ensureDir(path.join(baseDir, 'models'));
writeFile(
  path.join(baseDir, 'models', `${CardName}.ts`),
  processTemplate('models.template.ts')
);

// Create service file
console.log('Creating service...');
ensureDir(path.join(baseDir, 'services'));
writeFile(
  path.join(baseDir, 'services', `${CardName}Service.ts`),
  processTemplate('service.template.ts')
);

// Create test data file
console.log('Creating test data...');
ensureDir(path.join(baseDir, 'services/testData'));
writeFile(
  path.join(baseDir, 'services/testData', `${cardName}.ts`),
  processTemplate('testData.template.ts')
);

// Create hook file
console.log('Creating hook...');
ensureDir(path.join(baseDir, 'hooks'));
writeFile(
  path.join(baseDir, 'hooks', `use${CardName}.ts`),
  processTemplate('hook.template.ts')
);

// Create medium card
console.log('Creating medium card...');
const cardDir = path.join(baseDir, 'components', `${CardName}Card`);
ensureDir(cardDir);
ensureDir(path.join(cardDir, 'components'));
writeFile(
  path.join(cardDir, `${CardName}Card.tsx`),
  processTemplate('mediumCard.template.tsx')
);
writeFile(
  path.join(cardDir, 'index.ts'),
  processTemplate('index.template.ts')
);

// Create large card (optional)
if (hasLarge) {
  console.log('Creating large card...');
  writeFile(
    path.join(baseDir, 'components', `${CardName}CardLarge.tsx`),
    processTemplate('largeCard.template.tsx')
  );
}

console.log('');
console.log('Card created successfully!');
console.log('');
console.log('Next steps:');
console.log('');
console.log('1. Update models/{{CardName}}.ts with your data interfaces');
console.log('2. Implement API calls in services/{{CardName}}Service.ts');
console.log('3. Add realistic test data in services/testData/{{cardName}}.ts');
console.log('4. Customize the medium card UI in components/{{CardName}}Card/{{CardName}}Card.tsx');
if (hasLarge) {
  console.log('5. Customize the large card UI in components/{{CardName}}CardLarge.tsx');
}
console.log('');
console.log('6. Register the card in DashboardCards.tsx:');
console.log(`   - Import: import { I${CardName}Settings, DEFAULT_${CARD_NAME}_SETTINGS } from '../hooks/use${CardName}';`);
console.log(`   - Import: import { ${CardName}Card } from './components/${CardName}Card';`);
if (hasLarge) {
  console.log(`   - Import: import { ${CardName}CardLarge } from './components/${CardName}CardLarge';`);
}
console.log(`   - Add to CARD_DEFINITIONS`);
if (hasLarge) {
  console.log(`   - Add '${cardName}' to LARGE_CARDS array`);
}
console.log(`   - Add ${cardName}Settings to props interface`);
console.log(`   - Add renderCard case`);
if (hasLarge) {
  console.log(`   - Add renderLargeCard case`);
}
console.log('');
console.log('7. Register in CardConfigDialog.tsx:');
console.log(`   - Add card definition with settings`);
console.log('');
