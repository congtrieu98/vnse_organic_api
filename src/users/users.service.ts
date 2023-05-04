/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JWT_SECRET } from 'src/consfig/config';
import { UserResponseInterface } from './type/userResponse.interface';
import { userFillter } from './dto/user.filter';
import { LoginUserDto } from './dto/loginUser.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    const errorResponse = {
      errors: {}
    }
    const userByUsername = await this.userRepository.findOne({
      where: {
        username: createUserDto.username
      }
    })
    if (userByUsername) {
      errorResponse.errors['username'] = 'Username are taken!';
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const newUser = new User();
    Object.assign(newUser, createUserDto);
    return await this.userRepository.save(newUser);
  }

  async findAll(filter: userFillter): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');
    if(filter.status)
      query.where('user.status = :status', {status: filter.status})
    // console.log(await query.clone().getQuery())
    return await query.getMany();
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async remove(id: number, data: any): Promise<void> {
      const user = await this.userRepository.findOneBy({ id });
      if(user) {
        if( user.status === 'ENABLE') {
          await this.userRepository.update(id, data);
        }
      } else {
        throw new HttpException('khong ton tai user', HttpStatus.NOT_FOUND)
      }
  }

  // LOGIN

  async login(LoginUserDto: LoginUserDto):Promise<User> {
    const errorResponse = {
      errors: {
        username: 'username is invalid',
        password: 'password is invalid',
      }
    }
    const user = await this.userRepository.findOne({
      where: {
        username: LoginUserDto.username,
      }
    });

    if (!user) {
      throw new HttpException(errorResponse.errors.username, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isPasswordCorrect = await compare(LoginUserDto.password, user.password);

    if (!isPasswordCorrect) {
      throw new HttpException(errorResponse.errors.password, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    delete user.password;
    return user;
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(userId);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  generateJwt(user: User): string {
    return sign(
      {
        id: user.id,
        username: user.username
      },
      JWT_SECRET
    )
  }

  buildUserResponse(user: User): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      }
    }
  }

  // Middleware

  async findUserById(id: number):Promise<User> {
    return await this.userRepository.findOne({
      where: {
        id,
      }
    })
  }

} 
