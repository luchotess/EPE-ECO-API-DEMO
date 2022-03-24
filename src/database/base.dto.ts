import { connectDb }       from './connection';
import { Model } from 'mongoose';

export class BaseDto {
    constructor (readonly model: Model<any>) {
        connectDb();
    }

    async create (createDto: any): Promise<any> {
        const created = new this.model(createDto);
        return created.save();
    }

    async findAll (condition = {}): Promise<any[]> {
        return this.model.find(condition).exec();
    }

    async findOne (condition): Promise<any> {
        return this.model.findOne(condition).exec();
    }

    async update (_id: string, createUserDto: any): Promise<any> {
        return this.model.findOneAndUpdate({_id}, createUserDto, {new: true}).exec();
    }

    async delete (_id: string): Promise<any> {
        const deleted = await this.model.findOneAndDelete({_id}).exec();

        if (deleted) {
            return {
                success: true,
                deleted: deleted._id
            };
        } else {
            throw new Error('hola')
        }
    }
}
