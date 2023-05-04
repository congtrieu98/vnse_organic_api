/* eslint-disable prettier/prettier */
import { UserType } from "src/users/type/user.type";

export type ProfileType = UserType & {following: boolean, followerId: number};