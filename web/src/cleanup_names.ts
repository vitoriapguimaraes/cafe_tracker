import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
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
}

cleanup();
