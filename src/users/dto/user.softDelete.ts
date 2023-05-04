/* eslint-disable prettier/prettier */
import { QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';

@QueryService(User)
export class UserSoftDelete extends TypeOrmQueryService<User> {
    constructor(@InjectRepository(User) repo: Repository<User>) {
        // pass the use soft delete option to the service.
        super(repo, { useSoftDelete: true });
    }
}