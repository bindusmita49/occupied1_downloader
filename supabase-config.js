// Paste the SAME Supabase Project URL and anon public key used in the desktop app's supabase_client.py, so accounts work across both the website and the app.
const SUPABASE_URL = "https://qjfdcvxvrgpvpjsyaeaj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZmRjdnh2cmdwdnBqc3lhZWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NTkyNjAsImV4cCI6MjEwMzEzNTI2MH0.hRlnVTOzVBHnhxkhrsg1sG6od428QXD-rFZdTjOgnTY";

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
