import {LoginUser} from './DBTypes';

type MessageResponse = {
  message: string;
};

type ErrorResponse = MessageResponse & {
  stack?: string;
};

type LoginResponse = MessageResponse & {
  token: string;
  message: string;
  user: Omit<LoginUser, 'password'>;
};

type UserResponse = MessageResponse & {
  user: {user_id: number} | LoginUser;
};

export type {MessageResponse, ErrorResponse, LoginResponse, UserResponse};
