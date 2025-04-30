import { Role } from './enums/role';

export class User {
  public name: string;
  public email: string;
  public password: string;
  public role: Role = Role.User;

  constructor(public id: string) {}
}
