import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ndtrfcwuajlnztxwdyui.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kdHJmY3d1YWpsbnp0eHdkeXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwOTc0OTMsImV4cCI6MjEwMTY3MzQ5M30.h2jBhi2X8w_GSp-lxWYDID1bccHlA-CgPM3Oa97VJQI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.rpc('admin_get_shops');
  console.log('Shops from get_shops:', data);
}

test();
