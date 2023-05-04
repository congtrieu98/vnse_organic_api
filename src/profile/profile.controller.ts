/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UserDirector } from 'src/users/decorators/user.decorator';
import { ProfileResponseInterface } from './types/profileResponse.interface';
import { AuthGuard } from 'src/users/guards/auth.guard';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @UserDirector('id') currentUserId: number, 
    @Param('username') profileUsername: string,
  ):Promise<ProfileResponseInterface> {
    const profile = await this.profileService.followProfile(currentUserId, profileUsername)
    return this.profileService.buildProfileResponse(profile);
  }

  // @Get()
  // findAll() {
  //   return this.profileService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.profileService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
  //   return this.profileService.update(+id, updateProfileDto);
  // }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unFollowProfile(@UserDirector('id') currentUserId: number,
  @Param('username') profileUsername: string):Promise<ProfileResponseInterface> {
    const profile = await this.profileService.unFollowProfile(currentUserId, profileUsername)
    return this.profileService.buildProfileResponse(profile);
  }

  @Get(':username')
  async getProfile(
    @UserDirector('id') currentUserId: number, 
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponseInterface> {
    
    const profile = await this.profileService.getProfile(currentUserId, profileUsername);

    return this.profileService.buildProfileResponse(profile);

  }
}
