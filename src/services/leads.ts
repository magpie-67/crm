import { supabase, Lead, CallOutcome, LeadStatus } from "@/lib/supabase";
import { addDays, format } from "date-fns";

function getFollowUpDays(outcome: CallOutcome): number {
  switch (outcome) {
    case "No Answer": return 1;
    case "Missed": return 1;
    case "Spoke": return 2;
    case "Interested": return 3;
    default: return 1;
  }
}

function getStatusFromOutcome(outcome: CallOutcome): LeadStatus {
  switch (outcome) {
    case "Interested": return "hot";
    case "Spoke": return "contacted";
    case "No Answer": return "follow-up";
    case "Missed": return "follow-up";
    default: return "contacted";
  }
}

export async function createLead(lead: Omit<Lead, "id" | "created_at">) {
  const { data, error } = await supabase.from("leads").insert([lead]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateLead(id: string, updates: Partial<Omit<Lead, "id" | "created_at">>) {
  const { data, error } = await supabase.from("leads").update(updates).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function logCall(leadId: string, outcome: CallOutcome, content: string) {
  const now = new Date();
  const nextFollowUp = format(addDays(now, getFollowUpDays(outcome)), "yyyy-MM-dd");
  const newStatus = getStatusFromOutcome(outcome);

  const { error: noteError } = await supabase.from("notes").insert([{
    lead_id: leadId,
    content,
    outcome,
  }]);
  if (noteError) throw new Error(noteError.message);

  const { error: leadError } = await supabase.from("leads").update({
    last_call: now.toISOString(),
    call_outcome: outcome,
    next_follow_up: nextFollowUp,
    status: newStatus,
  }).eq("id", leadId);
  if (leadError) throw new Error(leadError.message);
}

export async function getDashboardStats() {
  const today = format(new Date(), "yyyy-MM-dd");
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [notesToday, followUpsToday, hotLeads, totalLeads] = await Promise.all([
    supabase.from("notes").select("id", { count: "exact" }).gte("created_at", todayStart.toISOString()),
    supabase.from("leads").select("id", { count: "exact" }).eq("next_follow_up", today),
    supabase.from("leads").select("id", { count: "exact" }).eq("status", "hot"),
    supabase.from("leads").select("id", { count: "exact" }),
  ]);

  return {
    callsToday: notesToday.count ?? 0,
    followUpsToday: followUpsToday.count ?? 0,
    hotLeads: hotLeads.count ?? 0,
    totalLeads: totalLeads.count ?? 0,
  };
}

export async function getTodayFollowUps() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("next_follow_up", today)
    .order("name");
  if (error) throw new Error(error.message);
  return data || [];
}
