/* eslint-disable prettier/prettier */
import { IsNotEmpty } from "class-validator";

export class CreatePostDto {
    @IsNotEmpty()
    readonly title: string

    @IsNotEmpty()
    readonly description: string

    @IsNotEmpty()
    readonly content: string

    readonly tagList?: string[]
}
