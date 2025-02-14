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

  async addTodo(todo: Todo) {
    // Obtener el usuario autenticado
    const { data: userData, error: userError } = await this.supabase_client.auth.getUser();
    
    if (userError || !userData?.user) {
      console.error('Error obteniendo usuario:', userError);
      return { data: null, error: userError };
    }

    const { id, ...todoData } = todo;
    todoData.user_id = userData.user.id; // Asignar el user_id

    const { data, error } = await this.supabase_client
      .from('todos')
      .insert(todoData);

    if (error) console.error('Error insertando todo:', error);
    return { data, error };
  }

  async getTodos() {
    // Obtener el usuario autenticado
    const { data: userData, error: userError } = await this.supabase_client.auth.getUser();

    if (userError || !userData?.user) {
      console.error('Error obteniendo usuario:', userError);
      return { todos: null, error: userError };
    }

    // Obtener los todos del usuario autenticado
    let { data: todos, error } = await this.supabase_client
      .from('todos')
      .select('*')
      // .eq('user_id', userData.user.id) // Filtrar por user_id
      .limit(10);

    // Incluir user_id en la respuesta
    return { todos, user_id: userData.user.id, error };
  }

  async deleteTodo(id: string) {
    const data = await this.supabase_client
      .from('todos')
      .delete()
      .match({ id: id });
    return data;
  }

  async update(todo: Todo) {
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
