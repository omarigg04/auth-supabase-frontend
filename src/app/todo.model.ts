export class Todo {
    id: string;
    name: string;
    done: boolean;
  
    constructor(id: string = '', name: string = '', done: boolean = false) {
      this.id = id;
      this.name = name;
      this.done = done;
    }
}