import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTuitDto, PaginationQueryDto, UpdateTuitDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import { User } from '../users/entities';
import { Tuit } from './entities/tuit.entity';

@Injectable()
export class TuitsService {
    
    constructor(@InjectRepository(Tuit) private readonly tuitRepository: Repository<Tuit>,
                @InjectRepository(User) private readonly userRepository: Repository<User>
    ){}

    async getTuits({ limit, offset }: PaginationQueryDto): Promise<Tuit[]> {
        return await this.tuitRepository.find({
            relations: ['user'],
            skip: offset,
            take: limit,
        });
    }

    async getTuit(id: number): Promise<Tuit> {
        const tuit = await this.tuitRepository.findOneById(id);

        if(!tuit){
            throw new NotFoundException("Resource not found");
        }
        
        return tuit;
    }

    async createTuit({ message, user }: CreateTuitDto) {
        const tuit = this.tuitRepository.create({message, user});
        return this.tuitRepository.save(tuit);
    }

    async updateTuit(id: number, { message }: UpdateTuitDto) {
        const tuit: Tuit = await this.tuitRepository.preload({
            id,
            message
        })

        if(!tuit){
            throw new NotFoundException("Resource not found");
        }
        tuit.message = message;

        return this.tuitRepository.save(tuit);
    }

    async removeTuit(id: number): Promise<void> {
        const tuit: Tuit = await this.tuitRepository.findOneById(id);

        if(!tuit){
            throw new NotFoundException("Resource not found");
        }

        this.tuitRepository.remove(tuit);

    }

}
