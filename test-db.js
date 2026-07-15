require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase.from('students').select('*').limit(1);
  if (error) {
    console.error('Error querying students:', JSON.stringify(error, null, 2));
  } else {
    console.log('Query successful. Rows:', data?.length);
  }
}

run();
