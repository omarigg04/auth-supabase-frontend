import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment.development';
import { Todo } from '../todo.model';

@Injectable({
  providedIn: 'root',
})
export class ActionsService {
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
  
  async addTodo(todo: Todo) {
    // Obtener el usuario autenticado
    const { data: userData, error: userError } = await this.supabase_client.auth.getUser();
    console.log('userdata: ', userData);
    
    if (userError || !userData?.user) {
      console.error('Error obteniendo usuario:', userError);
      return { data: null, error: userError };
    }

    const { id, email, ...todoData } = todo;
    todoData.user_id = userData.user.id; // Asignar el user_id

    const { data, error } = await this.supabase_client
      .from('todos')
      .insert(todoData);

    if (error) console.error('Error insertando todo:', error);
    return { data, error };
  }

  async getTodos() {
    // Obtener los todos y unir con la tabla user_profiles para traer el email
    let { data: todos, error } = await this.supabase_client
      .from('todos')
      .select(`
        id, created_at, name, done, user_id,
        user_profiles (email)
      `)
      .order('id', { ascending: true })
      .limit(10);
  
    if (error) {
      console.error('Error obteniendo todos:', error);
      return { todos: null, error };
    }
  
    return { todos, error };
  }

  async deleteTodo(id: string) {
    const data = await this.supabase_client
      .from('todos')
      .delete()
      .match({ id: id });
    return data;
  }

  async update(todo: Todo) {
    const {email, ...todoData } = todo;
    const { data, error } = await this.supabase_client
      .from('todos')
      .update(todo)
      .match({ id: todo.id });
  }

  async updateCheck(todo: Todo) {
    const { data, error } = await this.supabase_client
      .from('todos')
      .update({ done: todo.done })
      .match({ id: todo.id });
  }

  listenAll() {
    const mySubscription = this.supabase_client
      .channel('public:todos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, (payload: any) => {
        console.log('Change received!', payload);
      })
      .subscribe();
    return mySubscription;
  }
}
