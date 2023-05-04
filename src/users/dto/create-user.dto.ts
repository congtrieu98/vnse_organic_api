/* eslint-disable prettier/prettier */
import {IsNotEmpty, MinLength} from 'class-validator'

export class CreateUserDto {
    @IsNotEmpty()
    @MinLength(8)
    readonly username: string;

    @IsNotEmpty()
    readonly password: string;
}
