#!/usr/bin/env node
/**
 * Converts Vietnamese diacritics to ASCII (unaccented) equivalents.
 * Run: node scripts/convert-vi-no-diacritics.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const viDir = join(__dirname, '../src/i18n/locales/vi');

// Comprehensive Vietnamese diacritics -> ASCII map
const DIACRITICS = [
  // Lowercase a
  ['\u00E0', 'a'], ['\u00E1', 'a'], ['\u1EA1', 'a'], ['\u00E3', 'a'], ['\u1EA3', 'a'],
  ['\u1EAF', 'a'], ['\u1EB1', 'a'], ['\u1EB3', 'a'], ['\u1EB5', 'a'], ['\u1EB7', 'a'],
  ['\u00E2', 'a'], ['\u1EA5', 'a'], ['\u1EA7', 'a'], ['\u1EA9', 'a'], ['\u1EAB', 'a'], ['\u1EAD', 'a'],
  ['\u0103', 'a'], ['\u1EBB', 'a'], ['\u1EBD', 'a'], ['\u1EBF', 'a'], ['\u1EC1', 'a'], ['\u1EC3', 'a'], ['\u1EC5', 'a'], ['\u1EC7', 'a'],
  // Uppercase A
  ['\u00C0', 'A'], ['\u00C1', 'A'], ['\u1EA0', 'A'], ['\u00C3', 'A'], ['\u1EA2', 'A'],
  ['\u1EA4', 'A'], ['\u1EA6', 'A'], ['\u1EA8', 'A'], ['\u1EAA', 'A'], ['\u1EAC', 'A'],
  ['\u1EAE', 'A'], ['\u1EB0', 'A'], ['\u1EB2', 'A'], ['\u1EB4', 'A'], ['\u1EB6', 'A'],
  ['\u00C2', 'A'], ['\u0102', 'A'],
  // d
  ['\u0111', 'd'], ['\u0110', 'D'],
  // Lowercase e
  ['\u00E8', 'e'], ['\u00E9', 'e'], ['\u1EBB', 'e'], ['\u00EA', 'e'],
  ['\u1EBD', 'e'], ['\u1EBF', 'e'], ['\u1EC1', 'e'], ['\u1EC3', 'e'], ['\u1EC5', 'e'], ['\u1EC7', 'e'],
  // Uppercase E
  ['\u00C8', 'E'], ['\u00C9', 'E'], ['\u1EB8', 'E'], ['\u00CA', 'E'],
  ['\u1EBC', 'E'], ['\u1EBE', 'E'], ['\u1EC0', 'E'], ['\u1EC2', 'E'], ['\u1EC4', 'E'], ['\u1EC6', 'E'],
  // Lowercase i
  ['\u00EC', 'i'], ['\u00ED', 'i'], ['\u1ECB', 'i'], ['\u1EC9', 'i'],
  ['\u0129', 'i'],
  // Uppercase I
  ['\u00CC', 'I'], ['\u00CD', 'I'], ['\u1EC8', 'I'], ['\u0128', 'I'],
  // Lowercase o
  ['\u00F2', 'o'], ['\u00F3', 'o'], ['\u1ECF', 'o'], ['\u00F5', 'o'],
  ['\u00F4', 'o'], ['\u1ED1', 'o'], ['\u1ED3', 'o'], ['\u1ED5', 'o'], ['\u1ED7', 'o'], ['\u1ED9', 'o'],
  ['\u1EDF', 'o'], ['\u1EE1', 'o'], ['\u1EE3', 'o'],
  ['\u01A1', 'o'],
  // Uppercase O
  ['\u00D2', 'O'], ['\u00D3', 'O'], ['\u1ED0', 'O'], ['\u00D5', 'O'], ['\u1ECE', 'O'],
  ['\u1ED2', 'O'], ['\u1ED4', 'O'], ['\u1ED6', 'O'], ['\u1ED8', 'O'],
  ['\u1EE0', 'O'], ['\u1EE2', 'O'],
  ['\u1EE8', 'O'], ['\u1EEA', 'O'], ['\u1EEC', 'O'], ['\u1EEE', 'O'], ['\u1EF0', 'O'],
  ['\u00D4', 'O'], ['\u01A0', 'O'],
  // Lowercase u
  ['\u00F9', 'u'], ['\u00FA', 'u'], ['\u1EE5', 'u'], ['\u0169', 'u'],
  ['\u00FB', 'u'], ['\u01B0', 'u'],
  ['\u1EED', 'u'], ['\u1EEF', 'u'], ['\u1EF1', 'u'],
  ['\u1EE7', 'u'],
  // Uppercase U
  ['\u00D9', 'U'], ['\u00DA', 'U'], ['\u1EE4', 'U'], ['\u0168', 'U'],
  ['\u1EE6', 'U'], ['\u1EE8', 'U'], ['\u1EEA', 'U'], ['\u1EEC', 'U'], ['\u1EEE', 'U'], ['\u1EF0', 'U'],
  ['\u00DB', 'U'], ['\u01AF', 'U'],
  // Lowercase y
  ['\u00FD', 'y'], ['\u1EF3', 'y'], ['\u1EF7', 'y'], ['\u1EF9', 'y'], ['\u1EF5', 'y'],
  // Uppercase Y
  ['\u00DD', 'Y'], ['\u1EF2', 'Y'], ['\u1EF6', 'Y'], ['\u1EF8', 'Y'], ['\u1EF4', 'Y'],
];

function removeDiacritics(str) {
  if (typeof str !== 'string') return str;
  let result = str;
  for (const [diacritic, ascii] of DIACRITICS) {
    result = result.split(diacritic).join(ascii);
  }
  return result;
}

function processFile(filepath) {
  const raw = readFileSync(filepath, 'utf-8');
  const parsed = JSON.parse(raw);
  const converted = convertObject(parsed);
  writeFileSync(filepath, JSON.stringify(converted, null, 2), 'utf-8');
  console.log(`  Converted: ${filepath}`);
}

function convertObject(obj) {
  if (typeof obj === 'string') return removeDiacritics(obj);
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(v => convertObject(v));
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = convertObject(value);
  }
  return result;
}

const files = readdirSync(viDir).filter(f => f.endsWith('.json'));
console.log(`Converting ${files.length} Vietnamese locale files to no-diacritics...\n`);
for (const file of files) {
  processFile(join(viDir, file));
}
console.log('\nDone!');
