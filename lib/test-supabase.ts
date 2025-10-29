import { createClient } from "@supabase/supabase-js";

async function testSupabaseConnection() {
  console.log("🔍 Testing Supabase Connection...\n");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  console.log("Configuration:");
  console.log("✓ URL:", url);
  console.log("✓ Key:", key ? "✓ Loaded" : "✗ Missing");
  console.log("");

  if (!url || !key) {
    console.log("❌ ERROR: Missing Supabase credentials!");
    console.log("   Check .env.local file");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  console.log("Attempting to connect...\n");

  // Test 1: Ping connection
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1);
    if (error) {
      console.log("❌ Table Query Error:");
      console.log("   Code:", error.code);
      console.log("   Message:", error.message);
      console.log("");
      console.log("   📋 This means:");
      console.log("      → Database tables haven't been created yet");
      console.log("      → Run the SQL migration to create them");
      console.log("");
      console.log("   ✅ Fix: Run SQL_TO_RUN.txt in Supabase editor");
      process.exit(1);
    }
    console.log("✓ Supabase connection: OK");
  } catch (err) {
    console.log("❌ Connection Error:", err);
    process.exit(1);
  }

  console.log("\n✅ All systems operational!");
}

testSupabaseConnection();
