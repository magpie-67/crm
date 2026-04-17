import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: Lead;
        Insert: Omit<Lead, "id" | "created_at">;
        Update: Partial<Omit<Lead, "id" | "created_at">>;
      };
      notes: {
        Row: Note;
        Insert: Omit<Note, "id" | "created_at">;
        Update: Partial<Omit<Note, "id" | "created_at">>;
      };
    };
  };
};

export type LeadStatus = "new" | "contacted" | "follow-up" | "hot" | "closed";
export type CallOutcome = "No Answer" | "Missed" | "Spoke" | "Interested";

export interface Lead {
  id: string;
  name: string;
  contact_person: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  website_status: string | null;
  website_url: string | null;
  last_call: string | null;
  call_outcome: string | null;
  next_follow_up: string | null;
  status: LeadStatus;
  demo_link: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  lead_id: string;
  content: string;
  outcome: string;
  created_at: string;
}
