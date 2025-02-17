export class Todo {
    public id: string;
    public name: string;
    public done: boolean;
    public user_id: string;
    public email: string;

    constructor(id: string = '', name: string = '', done: boolean = false, user_id: string = '', email: string = '') {
      this.id = id;
      this.name = name;
      this.done = done;
      this.user_id = user_id;
      this.email = email;
    }
}