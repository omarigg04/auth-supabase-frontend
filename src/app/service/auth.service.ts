import { Injectable } from '@angular/core';
import {
  AuthChangeEvent,
  createClient,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import { environment } from 'src/environments/environment.development';
import { UserProfile } from '../user.model';

export interface User {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase_client: SupabaseClient;

  constructor() {
    this.supabase_client = createClient(
      environment.supabase.url,
      environment.supabase.key
    );
  }

  async getUser() {
    const { data: userData, error } = await this.supabase_client.auth.getUser();
    if (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
    return userData?.user;
  }
  
  //Register
  async signUp(email: string, password: string): Promise<any> {
    const { data, error } = await this.supabase_client.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }

    // Insert user data into user_profiles table
    const user = data.user;
    if (user) {
      const userProfile = new UserProfile(user.id, user.email ?? ''); // Create a new user profile
      const { error: insertError } = await this.supabase_client
        .from('user_profiles')
        .insert(userProfile);

      if (insertError) {
        console.error('Error inserting user profile:', insertError);
        return { data: null, error: insertError };
      }
    }

    return { data, error };
  }

  //Login
  signIn(email: string, password: string): Promise<any> {
    return this.supabase_client.auth.signInWithPassword({
      email,
      password,
    });
  }

  //SignOut
  public signOut(): Promise<any> {
    return this.supabase_client.auth.signOut();
  }

  // //get user status
  // getStatus() {
  //   return this.supabase_client.auth.getSession().then((res) => {
  //     console.log('res');
  //     return res;
  //   });
  // }
}
