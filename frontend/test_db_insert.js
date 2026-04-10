const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://kyhwomtqywmvfbzuevdv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aHdvbXRxeXdtdmZienVldmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2Njg3MTIsImV4cCI6MjA5MTI0NDcxMn0._8IfvRyhANrEBhKttuWo-FkVGDG6AM0w73iY5KQzVFc');
(async () => {
  const { data, error } = await supabase.from('designs').insert({
    title: 'Test', type: 'tshirt'
  });
  console.log("DB Insert attempt:", data, error);
})();
