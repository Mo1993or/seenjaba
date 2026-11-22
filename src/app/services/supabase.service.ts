import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({providedIn:'root'})
export class SupabaseService {
  private client: SupabaseClient | null = null;
  get configured(): boolean { return !!environment.supabaseUrl && !!environment.supabaseAnonKey; }

  getClient(): SupabaseClient {
    if (!this.configured) throw new Error('Supabase n’est pas encore configuré. Voir README.md.');
    if (!this.client) this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    return this.client;
  }
}
