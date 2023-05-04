/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn, BeforeInsert, OneToMany, ManyToMany, JoinTable } from "typeorm";
import {hash} from 'bcrypt';
import { UserStatus } from "../dto/user.status";
import { Post } from "src/post/entities/post.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        default: ''
    })
    username: string

    @Column()
    password: string

    @Column({
        type: "enum",
        enum: UserStatus,
        default: UserStatus.ENABLE
    })
    status: UserStatus

    @Column({
        nullable: false,
        default: ''
    })
    image: string

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createDate: Date

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    updateDate: Date

    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, 10);
    }

    @OneToMany(() => Post, (post) => post.author) 
    posts: Post[]

    @ManyToMany(() => Post)
    @JoinTable()
    favorites: Post[]
}