/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { FollowEntity } from './entities/follow.entity';
import { ProfileType } from './types/profile.type';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>,
    ) {}
  // create(createProfileDto: CreateProfileDto) {
  //   return 'This action adds a new profile';
  // }

  // findAll() {
  //   return `This action returns all profile`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} profile`;
  // }

  // update(id: number, updateProfileDto: UpdateProfileDto) {
  //   return `This action updates a #${id} profile`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} profile`;
  // }

  async getProfile(currentUserId: number, profileUsername: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: {
        username: profileUsername,
      }
    });

    if (!user) {
      throw new HttpException('Profile does not exit', HttpStatus.NOT_FOUND);
    }

    const followStatus = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id
      }
    })

    return {...user, following: Boolean(followStatus), followerId: followStatus ? currentUserId : 0}
  }


   buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.password;
    delete profile.createDate;
    delete profile.updateDate;
    return {profile};
  }

  async followProfile(currentUserId: number, profileUsername: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: {
        username: profileUsername,
      }
    });

    if (!user) {
      throw new HttpException('Profile does not exit', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === user.id) {
      throw new HttpException('Follower and Following can not equal!', HttpStatus.BAD_REQUEST)
    }

    const follow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      }
    })

    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = currentUserId;
      followToCreate.followingId = user.id;
      await this.followRepository.save(followToCreate);
    }

    return {...user, following: true, followerId: currentUserId}
  }

  async unFollowProfile(currentUserId: number, profileUsername: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: {
        username: profileUsername,
      }
    });

    if (!user) {
      throw new HttpException('Profile does not exit', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === user.id) {
      throw new HttpException('Follower and Following can not equal!', HttpStatus.BAD_REQUEST)
    }

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: user.id
    });

    return {...user, following: false, followerId: 0}
  }
}
