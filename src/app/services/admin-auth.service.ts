
import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly supabase = inject(SupabaseService);

  async signIn(email: string, password: string): Promise<void> {
    const client = this.supabase.getClient();

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error('Email ou mot de passe incorrect.');
    }

    if (!data.user) {
      await client.auth.signOut();
      throw new Error('Impossible de récupérer votre compte.');
    }

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      await client.auth.signOut();
      throw new Error('Accès refusé : ce compte n’est pas administrateur.');
    }
  }

  async hasAdminAccess(): Promise<boolean> {
    const client = this.supabase.getClient();

    const { data: userData, error: userError } =
      await client.auth.getUser();

    if (userError || !userData.user) {
      return false;
    }

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    return !profileError && profile?.role === 'admin';
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.getClient().auth.signOut();

    if (error) {
      throw error;
    }
  }
}
