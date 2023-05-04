/* eslint-disable prettier/prettier */
import { User } from "../entities/user.entity";

export type UserType = Omit<User, 'hashPassword'>;