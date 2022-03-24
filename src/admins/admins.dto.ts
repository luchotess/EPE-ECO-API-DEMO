import { BaseDto } from '../database/base.dto';
import { Properties } from '../properties/properties.model';

export class AdminsDto extends BaseDto {
    constructor(model) {
        super(model);
    }

    async findAll (condition = {}): Promise<any> {
        try {
            const users = await this.model.find(condition).exec();
            return users.map(user => user.serialize());
        } catch (e) {
            console.log(e)
        }

    }

    async findAllWithProperties (): Promise<any[]> {
        const users = await this.model.find().populate({
            path: 'properties',
            select: '-users',
            model: Properties
        }).exec();
        return users.map(user => user.serialize());
    }

    async findOneWithProperties (condition): Promise<any> {
        const user = await this.model.findOne(condition).populate({
            path: 'properties',
            select: '-users',
            model: Properties
        }).exec();
        return user;
    }

    async updatePassword (id, password): Promise<any> {
        console.log('sending to model', id, password);
        try {
            const user = await this.model.findOne({_id: id}).exec();
            const updatedUser = await user.updatePassword(password)
            return updatedUser.serialize();
        } catch(err) {
            console.log(err);
        }
    }
}
