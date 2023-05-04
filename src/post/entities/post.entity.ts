/* eslint-disable prettier/prettier */
import { User } from "src/users/entities/user.entity";
import { BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    slug: string

    @Column()
    title: string

    @Column({default: ''})
    content: string

    @Column({default: ''})
    description: string

    @Column('simple-array')
    tagList: string[]

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createDate: Date

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    updateDate: Date

    @Column({default: 0})
    favoritesCount: number

    @BeforeUpdate()
    updateTimestamp() {
        this.updateDate = new Date()
    }

    @ManyToOne(() => User, (user) => user.posts, { eager: true }) // Việc gán cờ eager này là để tự động load author vào data. Cờ này chỉ được đặt ở 1 phía của quan hệ
    author: User

}