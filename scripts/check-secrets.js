#!/usr/bin/env node

// Pre-deploy check: Verify that required secrets are configured
import { execSync } from 'child_process';

console.log('🔐 Checking required secrets...\n');

try {
  // Get Worker name from wrangler.toml
  const wranglerOutput = execSync('wrangler whoami', { encoding: 'utf8' });
  console.log('✅ Logged in to Cloudflare\n');

  // Try to get secret list
  console.log('📋 Checking for AERODATABOX_API_KEY...');
  
  try {
    const secretList = execSync('wrangler secret list', { encoding: 'utf8' });
    
    if (secretList.includes('AERODATABOX_API_KEY')) {
      console.log('✅ AERODATABOX_API_KEY is configured\n');
      console.log('✨ All secrets are configured! You can deploy.\n');
      process.exit(0);
    } else {
      console.log('❌ AERODATABOX_API_KEY is NOT configured\n');
      console.log('To fix this, run:\n');
      console.log('  wrangler secret put AERODATABOX_API_KEY\n');
      console.log('Then paste your RapidAPI key when prompted.\n');
      console.log('Get your API key from: https://rapidapi.com/aerodatabox/api/aerodatabox\n');
      process.exit(1);
    }
  } catch (error) {
    console.log('⚠️  Could not check secrets. Make sure you are logged in to Cloudflare.\n');
    console.log('Run: wrangler login\n');
    process.exit(1);
  }

} catch (error) {
  console.log('❌ Error checking secrets:', error.message);
  console.log('\nMake sure you have:\n');
  console.log('  1. Installed wrangler: npm install -g wrangler\n');
  console.log('  2. Logged in: wrangler login\n');
  process.exit(1);
}
