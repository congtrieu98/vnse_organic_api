/* eslint-disable prettier/prettier */
import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { JwtPayload, verify } from 'jsonwebtoken'
import { JWT_SECRET } from 'src/consfig/config'
import { ExpressRequest } from 'src/users/type/expressRequest.interface'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly userService: UsersService){}

    async use(req: ExpressRequest, _: Response, next: NextFunction) {
        // console.log('authMiddle', req.headers)
        if (!req.headers.authorization) {
            req.user = null
            next()
            return 
        }
        
        const token = req.headers.authorization.split(' ')[1]
        
        try {
            const decode = verify(token, JWT_SECRET) as JwtPayload
            // console.log('decode:', decode.id)
            // const idUser = decode.parseIntPipe(decode.id)
            const user = await this.userService.findUserById(decode.id);
            req.user = user;
            next()
        } catch (error) {
            req.user = null
            next()
        }
    }
}