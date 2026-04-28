import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nfgjmpvvhgdszqvdbxgh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZ2ptcHZ2aGdkc3pxdmRieGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMzk0MDYsImV4cCI6MjA5MjYxNTQwNn0.4nzo8Rrqes6db4iq_8ka27b5hmyTXAVHinZr09vkka8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
