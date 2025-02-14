import { Component } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { Todo } from '../../todo.model';
  import { ActionsService } from 'src/app/service/actions.service';
  import { FormsModule } from '@angular/forms';

  @Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
  })
  export class DashboardComponent {

    todos: Todo[] = [];
    todo: Todo = new Todo();
    actionLabel: string = 'ADD';
    user_id: string = '';

    constructor(private api: ActionsService) { }

    ngOnInit(): void {
      this.fetchTodos();
      this.clear();
      // console.log();


      
    }

    addTodo() {
      if (this.todo && this.todo.id) {
        //Update if exists ID{
        this.update();
        return;
      }
      this.api
        .addTodo(this.todo)
        .then((payload) => {
          if (payload && payload.data) {
            this.todos.push(payload.data[0]);

          }
          this.fetchTodos(); // Fetch todos after adding a new one
        })
        .catch((err) => console.log(`Error in add TODO ${err}`));
      this.clear();
    }

    editTodo(todo: Todo) {
      this.todo = todo;
      this.actionLabel = 'UPDATE';
    }

    update() {
      this.api.update(this.todo).then(() => {
        let foundIndex = this.todos.findIndex((t) => t.id == this.todo.id);
        this.todos[foundIndex] = this.todo;
        this.clear();
      });
    }

    checkTodo(todoCheck: Todo) {
      todoCheck.done = !todoCheck.done;
      this.api.updateCheck(todoCheck);
    }

    delete(todo: Todo) {
      this.api
        .deleteTodo(todo.id)
        .then((res) => {
          (this.todos = this.arrayRemove(this.todos, todo.id));
          // console.log('res', res.data)
        });

    }

    arrayRemove(arr: Todo[], id: string) {
      return arr.filter((ele) => ele.id != id);
    }

    clear() {
      this.todo = new Todo();
      this.actionLabel = 'ADD';
    }

    fetchTodos() {
      this.api.getTodos().then((data) => {
        this.todos = (data.todos ?? []).map(
          (item: any) => new Todo(item.id, item.name, item.done, item.user_id, item.user_profiles?.email)
        );        
        console.log('this.todos', this.todos);
      });
    }
  }
