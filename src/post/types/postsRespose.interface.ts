/* eslint-disable prettier/prettier */
import { PostType } from "./post.types";

export interface PostsResposeInterface {
    posts: PostType[];
    postsCount: number;
}