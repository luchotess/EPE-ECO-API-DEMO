import { BaseDto } from '../database/base.dto';
import { Admins } from "../admins/admins.model";

export class PropertiesDto extends BaseDto {
    constructor(model) {
        super(model);
    }

    async findAll (condition= {}): Promise<any> {
        const properties = await this.model.find(condition).exec();
        const users = await Admins.find().exec();

        const result = properties.map(property => {
            const propertySerialized = property.serialize()
            propertySerialized.users = users.map(user => user.serialize())
                .filter(user => user.properties.includes(property._id));
            return propertySerialized;
        })

        return result;
    }

    async findOne (condition= {}): Promise<any> {
        const property = await this.model.findOne(condition).exec();

        const users = await Admins.find().exec();

        const propertySerialized = property.serialize()

        propertySerialized.users = users.map(user => user.serialize())
            .filter(user => user.properties.includes(property._id));

        return propertySerialized;
    }

    public async verify (properties: string, userId: string): Promise<any> {
        const foundProperties = await this.model.find({_id: {'$in': properties}}).exec();

        const user = await Admins.findOne({_id: userId});

        const matchedProperties = JSON.stringify(user.properties) === JSON.stringify(properties);

        console.log(user.roles);
        console.log(matchedProperties, foundProperties.length, properties.length)

        if (matchedProperties && foundProperties.length === properties.length) {
            return foundProperties;
        }

        return null;
    }

    public async deleteUserfromProperty (propertyId: string, userId: string): Promise<any> {
        const user = await Admins.findOne({_id: userId}).exec();

        user.properties = user.properties.filter(property => property !== propertyId);

        return user.save();
    }
}
