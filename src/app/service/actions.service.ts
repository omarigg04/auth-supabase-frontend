import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment.development';


import { Todo } from '../todo.model';




@Injectable({
  providedIn: 'root',
})
export class ActionsService {
  // supabase: SupabaseClient = createClient(initSupabase.supabaseUrl, initSupabase.supabaseKey);
  private supabase_client: SupabaseClient;

  constructor() {
        this.supabase_client = createClient(
          environment.supabase.url,
          environment.supabase.key
        );
   }

   async addTodo(todo: Todo) {
    // Eliminar `id` del objeto antes de insertarlo si no es necesario
    const { id, ...todoData } = todo;
  
    const { data, error } = await this.supabase_client
      .from('todos')
      .insert(todoData); // No enviar `id`
  
    if (error) console.error('Error inserting todo:', error);
    return { data, error };
  }

  async getTodos() {
    let { data: todos, error } = await this.supabase_client
      .from('todos')
      .select('*')
      .limit(10)
    return { todos, error };
  }

  async deleteTodo(id: string) {
    const data = await this.supabase_client
      .from('todos')
      .delete()
      .match({ id: id })
    return data
  }

  async update(todo: Todo) {
    const { data, error } = await this.supabase_client
      .from('todos')
      .update(todo)
      .match({ id: todo.id })
  }

  async updateCheck(todo: Todo) {
    const { data, error } = await this.supabase_client
      .from('todos')
      .update({ done: todo.done })
      .match({ id: todo.id })
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
