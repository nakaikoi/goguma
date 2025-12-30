/**
 * Test script to validate environment variables
 * Run with: npx tsx src/test-env.ts
 */

import 'dotenv/config';
import { env } from './config/env.js';
import { supabase, supabaseAdmin } from './config/supabase.js';
import { logger } from './config/logger.js';

async function testEnv() {
  console.log('🧪 Testing environment configuration...\n');

  // Test 1: Environment variables validation
  console.log('✅ Environment variables loaded successfully');
  console.log(`   - SUPABASE_URL: ${env.SUPABASE_URL.substring(0, 30)}...`);
  console.log(`   - PORT: ${env.PORT}`);
  console.log(`   - NODE_ENV: ${env.NODE_ENV}`);
  console.log(`   - API_PREFIX: ${env.API_PREFIX}`);
  console.log(`   - LOG_LEVEL: ${env.LOG_LEVEL}\n`);

  // Test 2: Supabase connection
  console.log('🔌 Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('items').select('count').limit(0);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.error('   ⚠️  Database tables may not be created yet.');
        console.error('   💡 Run the migrations from docs/DATABASE_SCHEMA.md');
      }
      process.exit(1);
    }
    
    console.log('✅ Supabase connection successful (anon key)\n');
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    process.exit(1);
  }

  // Test 3: Supabase admin connection
  console.log('🔌 Testing Supabase admin connection...');
  try {
    const { data, error } = await supabaseAdmin.from('items').select('count').limit(0);
    
    if (error) {
      console.error('❌ Supabase admin connection failed:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Supabase admin connection successful (service role key)\n');
  } catch (error) {
    console.error('❌ Supabase admin connection error:', error);
    process.exit(1);
  }

  // Test 4: Check if tables exist
  console.log('📊 Checking database tables...');
  const tables = ['users', 'items', 'item_images', 'listing_drafts', 'jobs', 'ebay_accounts'];
  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { error } = await supabaseAdmin.from(table).select('*').limit(0);
      if (error) {
        console.error(`   ❌ Table '${table}' does not exist or is not accessible`);
        allTablesExist = false;
      } else {
        console.log(`   ✅ Table '${table}' exists`);
      }
    } catch (error) {
      console.error(`   ❌ Error checking table '${table}':`, error);
      allTablesExist = false;
    }
  }

  console.log('');

  // Summary
  if (allTablesExist) {
    console.log('🎉 All tests passed! Your environment is configured correctly.');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Test the API: curl http://localhost:3000/health');
  } else {
    console.log('⚠️  Some tables are missing. Run the migrations from docs/DATABASE_SCHEMA.md');
  }
}

testEnv().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

