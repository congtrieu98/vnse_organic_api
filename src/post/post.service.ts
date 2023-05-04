/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { DataSource, DeleteResult, QueryBuilder, Repository } from 'typeorm';

import { FollowEntity } from 'src/profile/entities/follow.entity';
import { User } from 'src/users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostResponseInterface } from './types/postResponse.interface';
import { PostsResposeInterface } from './types/postsRespose.interface';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) 
    private readonly postRepository: Repository<Post>,
    private dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    ) {}

  async createPost(currentUser: User, createPostDto: CreatePostDto): Promise<Post> {
    const post = new Post();
    Object.assign(post, createPostDto);
    if (!post.tagList) {
      post.tagList = [];
    }

    post.slug = this.getSlug(createPostDto.title)
    post.author = currentUser; // Gán thêm 1 phần tử author vào trong Object post

    return await this.postRepository.save(post);
  }

  buildPostRespose(post: Post): PostResponseInterface {
    return {post}
  }

  private getSlug(title: string): string {
    return (
      slugify(title, {lower: true}) + '-' + 
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }

  async findBySlug(slug: string): Promise<Post> {
    return await this.postRepository.findOne({
      where: {slug}
    })
  }

  async findAll(currentUserId: number, query: any): Promise<PostsResposeInterface> {
    const queryBuilder = this.dataSource
          .getRepository(Post)
          .createQueryBuilder('posts')
          .leftJoinAndSelect('posts.author', 'author');
          
          // .orderBy('posts.id', 'DESC');

    if (query.tag) {
      queryBuilder.andWhere('posts.tagList LIKE :tag', {tag: `%${query.tag}%`});
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: {
          username: query.author
        }
      });
      queryBuilder.andWhere('posts.authorId = :id', {
        id: author.id
      })
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne({
        where: {
          username: query.favorited
        },
        relations: ['favorites']
      })

      const ids = author.favorites.map((el) => el.id);

      if (ids.length > 0 ) {
        queryBuilder.andWhere('author.id IN (:...ids)', ids);
      } else {
        queryBuilder.andWhere('1=0'); // Sẻ k trả về dsach post nũa mà trả về mảng rỗng
      }
      console.log('author:', author)
    }

    const postsCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit)
    }

    if (query.offset) {
      queryBuilder.offset(query.offset)
    }

    let favoritieIds: number[] = [];
    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: {
          id: currentUserId,
        },
        relations: ['favorites'],
      });

      favoritieIds = currentUser.favorites.map((favorite) => favorite.id );
    }

    const posts = await queryBuilder.getMany();

    const postWithFavorited = posts.map((post) => {
      const favorited = favoritieIds.includes(post.id); // Kieemr tra post.id có tồn tại trong mảng favoriteIds hay k?
      return {...post, favorited};
    })

    return {posts: postWithFavorited, postsCount};
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  async deletePost(slug: string, currentUserId: number): Promise<DeleteResult> {
    const post = await this.findBySlug(slug);
    if (!post) {
      throw new HttpException('Post does not exit', HttpStatus.NOT_FOUND)
    }

    if (post.author.id !== currentUserId) {
      throw new HttpException('You are not author', HttpStatus.FORBIDDEN)
    }
    return await this.postRepository.delete({slug});
  }

  async updatePost(slug: string, currentUserId: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findBySlug(slug);
    if (!post) {
      throw new HttpException('Post does not exit', HttpStatus.NOT_FOUND)
    }

    if (post.author.id !== currentUserId) {
      throw new HttpException('You are not author', HttpStatus.FORBIDDEN)
    }

    Object.assign(post, updatePostDto)
    return await this.postRepository.save(post)
  }

  async addPostToFavorites(userId: number, slug: string): Promise<Post> {
    const post = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['favorites'],
    })

    // Tìm những bài viết KHÔNG được ưa thích
    // Trong trường họp này nếu mà kết quả trả về là -1 nghĩa là k tìm thấy bài viết nào thõa mãn điều kiện thì nó là bài viết chuhwa được yêu thích
    const isNotFavorites = user.favorites.findIndex((postInfavorites) => postInfavorites.id === post.id) === -1 ;

    if (isNotFavorites) {
      user.favorites.push(post);
      post.favoritesCount++;
      await this.userRepository.save(user);
      await this.postRepository.save(post);
    }
    // console.log('user:', user)

    return post
  }

  async deletePostFromFavorites(userId: number, slug: string): Promise<Post> {
    const post = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['favorites'],
    })

    // Tìm những bài viết ĐÃ được ưa thích
    const postIndex = user.favorites.findIndex((postInfavorites) => postInfavorites.id === post.id) ;

    if (postIndex >=0) {
      user.favorites.splice(postIndex, 1);
      post.favoritesCount--;
      await this.userRepository.save(user);
      await this.postRepository.save(post);
    }
    // console.log('user:', user)
    return post
  }

  // GET LIST POSTS FOLLOWED
  async getPostsFollowed(currentUserId: number, query: any): Promise<PostsResposeInterface> {
    const follows = await this.followRepository.find({
      where: {
        followerId: currentUserId,
      }
    });

    if (follows.length === 0) {
      return {posts: [], postsCount: 0};
    }

    const followingUserId = follows.map((follow) => follow.followerId)
    const queryBuilder = this.dataSource
          .getRepository(Post)
          .createQueryBuilder('post')
          .leftJoinAndSelect('post.author', 'author')
          .where('post.authorId IN (:...ids)', {ids: followingUserId})
          .orderBy('post.id', 'DESC');

    const postsCount = await queryBuilder.getCount();
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const posts = await queryBuilder.getMany()
  
  return {posts, postsCount}
  }
}
