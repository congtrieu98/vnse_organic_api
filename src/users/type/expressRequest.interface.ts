/* eslint-disable prettier/prettier */
import { Request } from "express";
import { User } from "../entities/user.entity";

export interface ExpressRequest extends Request {
    user?: User
}