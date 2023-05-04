/* eslint-disable prettier/prettier */

import { Post } from "../entities/post.entity";

export type PostType = Omit<Post, 'updateTimestamp'>;