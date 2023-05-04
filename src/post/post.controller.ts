/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { UserDirector } from 'src/users/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { PostResponseInterface } from './types/postResponse.interface';
import { PostsResposeInterface } from './types/postsRespose.interface';
import { BackendValidationPipe } from 'src/share/pipes/backendValidation.pipe';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createPost(@UserDirector() currentUser: User, @Body('post') createPostDto: CreatePostDto): Promise<PostResponseInterface> {
    const post = await this.postService.createPost(currentUser, createPostDto);
    return this.postService.buildPostRespose(post)
  }

  // @Get(':slug')
  // async getSinglePost(@Param('slug') slug: string): Promise<PostResponseInterface> {
  //   console.log("get 1")
  //   const post = await this.postService.findBySlug(slug);
  //   return this.postService.buildPostRespose(post)
  // }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deletePost(
    @Param('slug') slug: string,
    @UserDirector('id') currentUserId: number, 
    ) {
    return await this.postService.deletePost(slug, currentUserId);
  }

  @Get()
  async findAll(@UserDirector('id') currentUserId: number, @Query() query: any): Promise<PostsResposeInterface> {
    console.log("get 2")
    return await this.postService.findAll(currentUserId, query);
  }

  // @Get(':id')
  // findOne(@Param('id') id: number) {
  //   console.log("get 3")
  //   return this.postService.findOne(+id);
  // }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updatePost(
    @UserDirector('id') currentUserId: number, 
    @Param('slug') slug: string,
    @Body('post')
    updatePostDto: UpdatePostDto) {
      const post = await this.postService.updatePost(slug, currentUserId, updatePostDto);
      return this.postService.buildPostRespose(post);
  }

  @Post(':slug/favorites')
  @UseGuards(AuthGuard)
  async addPostToFavorites(
    @UserDirector('id') currentUserId: number, @Param('slug') slug: string,
  ): Promise<PostResponseInterface> {
    const post = await this.postService.addPostToFavorites(currentUserId, slug)
    return this.postService.buildPostRespose(post)
  }

  @Delete(':slug/favorites')
  @UseGuards(AuthGuard)
  async deletePostFromFavorites(
    @UserDirector('id') currentUserId: number, @Param('slug') slug: string,
  ): Promise<PostResponseInterface> {
    const post = await this.postService.deletePostFromFavorites(currentUserId, slug)
    return this.postService.buildPostRespose(post)
  }

  // Get danh sách bài viết được follow
  @Get('listPostFollow')
  @UseGuards(AuthGuard)
   getPostsFollowed(
    @UserDirector('id') currentUserId: number,
    @Query() query: any
    ): Promise<PostsResposeInterface> {
    return this.postService.getPostsFollowed(currentUserId, query);
  }


}
