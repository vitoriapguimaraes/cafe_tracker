const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://wlnpytgodulyeqsvqshd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsbnB5dGdvZHVseWVxc3Zxc2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwOTY5MzEsImV4cCI6MjA4NTY3MjkzMX0.vCn_BS6EePOeTR_cLEHRZMWOODkoAAAI0v7Rrq-KE2o";
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  const { data: accounts, error } = await supabase.from('accounts').select('id, name');
  
  if (error) {
    console.error('Error fetching accounts:', error);
    return;
  }

  for (const account of accounts) {
    const originalName = account.name;
    const cleanedName = originalName
      .replace(/\s*\[.\]\s*-\s*(Banco|Cartão)/i, "")
      .replace(/\s*\[.\]/i, "")
      .trim();

    if (originalName !== cleanedName) {
      console.log(`Updating "${originalName}" -> "${cleanedName}"`);
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ name: cleanedName })
        .eq('id', account.id);
      
      if (updateError) {
        console.error(`Error updating account ${account.id}:`, updateError);
      }
    }
  }
  console.log('Cleanup finished.');
}

cleanup();
