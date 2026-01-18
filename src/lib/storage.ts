import { IssueScopingSession } from "@/types/devin";
import { supabase } from "./supabase";

export async function getAllSessions(): Promise<IssueScopingSession[]> {
  const { data, error } = await supabase
    .from('issue_scoping_sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return data || [];
}

export async function getSessionById(id: string): Promise<IssueScopingSession | null> {
  const { data, error } = await supabase
    .from('issue_scoping_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }

  return data;
}

export async function getSessionByIssue(
  repoOwner: string,
  repoName: string,
  issueNumber: number
): Promise<IssueScopingSession | null> {
  const { data, error } = await supabase
    .from('issue_scoping_sessions')
    .select('*')
    .eq('repo_owner', repoOwner)
    .eq('repo_name', repoName)
    .eq('issue_number', issueNumber)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching session:', error);
    return null;
  }

  return data;
}

export async function createSession(
  session: Omit<IssueScopingSession, "id" | "created_at" | "updated_at">
): Promise<IssueScopingSession> {
  const newSession: IssueScopingSession = {
    ...session,
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('issue_scoping_sessions')
    .insert([newSession])
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }

  return data;
}

export async function updateSession(
  id: string,
  updates: Partial<IssueScopingSession>
): Promise<IssueScopingSession | null> {
  const { data, error } = await supabase
    .from('issue_scoping_sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating session:', error);
    return null;
  }

  return data;
}

export async function deleteSession(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('issue_scoping_sessions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting session:', error);
    return false;
  }

  return true;
}
