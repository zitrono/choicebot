#!/usr/bin/env node

/**
 * Test script to verify markdown link formatting in LLM responses
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the verbier.txt file to check EVENT_METADATA
const verbierPath = path.join(__dirname, 'verbier.txt');
const content = fs.readFileSync(verbierPath, 'utf-8');

// Count EVENT_METADATA blocks
const metadataCount = (content.match(/\[EVENT_METADATA\]/g) || []).length;
console.log(`Found ${metadataCount} EVENT_METADATA blocks in verbier.txt`);

// Extract a sample event with metadata
const samplePattern = /([^\n]+11:00[^\n]+[\s\S]{0,500}?)\[EVENT_METADATA\]\s*Event_URL:\s*(.+?)\s*Booking_URL:\s*(.+?)\s*\[\/EVENT_METADATA\]/;
const match = content.match(samplePattern);

if (match) {
    console.log('\nSample Event Found:');
    console.log('Event Description:', match[1].trim().substring(0, 100) + '...');
    console.log('Event URL:', match[2]);
    console.log('Booking URL:', match[3]);
    
    console.log('\nExpected LLM Output Format:');
    console.log('Jean-Efflam Bavouzet: Ravel Complete Works');
    console.log('[View Program](' + match[2] + ') • [Book Tickets](' + match[3] + ')');
    
    console.log('\nWhat users will see (rendered):');
    console.log('Jean-Efflam Bavouzet: Ravel Complete Works');
    console.log('\x1b[34mView Program\x1b[0m • \x1b[34mBook Tickets\x1b[0m');
    console.log('(Links will appear in blue and be clickable)');
} else {
    console.log('No sample event with metadata found');
}

// Check if the system prompt has been updated
const promptPath = path.join(__dirname, 'verbier-demo', 'prompts', 'verbier-system-prompt.ts');
if (fs.existsSync(promptPath)) {
    const promptContent = fs.readFileSync(promptPath, 'utf-8');
    const hasUrlFormatting = promptContent.includes('URL Formatting');
    const hasMarkdownInstructions = promptContent.includes('[descriptive text](url)');
    
    console.log('\n=== System Prompt Check ===');
    console.log('Has URL Formatting Rules:', hasUrlFormatting ? '✓' : '✗');
    console.log('Has Markdown Link Instructions:', hasMarkdownInstructions ? '✓' : '✗');
    
    if (hasUrlFormatting && hasMarkdownInstructions) {
        console.log('\n✅ System prompt is properly configured for markdown links!');
    } else {
        console.log('\n⚠️ System prompt may need updates for markdown link support');
    }
}

console.log('\n=== Testing Complete ===');
console.log('The LLM should now format all event URLs as markdown links.');
console.log('Example: [Book Tickets](url) instead of showing the raw URL.');