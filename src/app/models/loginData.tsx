import { User } from "./User";

export type LoginData = {
    token?: string; // optional if not present
    user: User;
  };