import { useEffect, useState } from "react";
import { supabase, Lead } from "@/lib/supabase";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();

    const channel = supabase
      .channel("leads-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { leads, loading, error, refetch: fetchLeads };
}

export function useLeadNotes(leadId: string) {
  const [notes, setNotes] = useState<import("@/lib/supabase").Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    setNotes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!leadId) return;
    fetchNotes();

    const channel = supabase
      .channel(`notes-${leadId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notes", filter: `lead_id=eq.${leadId}` }, () => {
        fetchNotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  return { notes, loading, refetch: fetchNotes };
}
