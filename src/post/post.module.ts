/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { FollowEntity } from 'src/profile/entities/follow.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Post, User, FollowEntity])],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule {}
