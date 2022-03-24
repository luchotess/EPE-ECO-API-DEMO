import { Middleware }  from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { PropertiesDto }     from './properties.dto';
import { Properties }        from './properties.model';
import { Admins } from "../admins/admins.model";
import { AdminsDto } from "../admins/admins.dto";
import * as AWS from 'aws-sdk';

const S3 = new AWS.S3();

let PropertiesModel = new PropertiesDto(Properties);
let UserModel = new AdminsDto(Admins);

export async function getPropertiesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        const properties = await PropertiesModel.findAll();
        lambda.context.succeed(HttpSucceedResponse(properties));
    });
}

export async function getOnePropertiesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        const property = await PropertiesModel.findOne({ _id: lambda.event.params.id });
        lambda.context.succeed(HttpSucceedResponse(property));
    });
}

export async function getPropertyCategories (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        const property = await PropertiesModel.findOne({ _id: lambda.event.params.id });
        lambda.context.succeed(HttpSucceedResponse(property.categories));
    });
}

export async function getUserPropertiesFunction (event, context) {
    return new Middleware().run(event, context, ['admin', 'superadmin']).then(async lambda => {
        const user = await UserModel.findOneWithProperties({_id: lambda.event.params.id});
        lambda.context.succeed(HttpSucceedResponse(user.properties));
    });
}

export async function createPropertiesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        try {
            const newProperties = await PropertiesModel.create(event.body);
            const savedProperties = await newProperties.save();
            lambda.context.succeed(HttpSucceedResponse(await savedProperties));
        } catch (err) {
            lambda.context.succeed(HttpFailureResponse("Error when creating a Properties.", 400));
        }
    });
}

export async function updatePropertiesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await PropertiesModel.update(lambda.event.params.id, lambda.event.body)));
    });
}

export async function deletePropertiesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await PropertiesModel.delete(lambda.event.params.id)));
    });
}

export async function deleteUserFromPropertyFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        const propertyId = lambda.event.params.id;
        const userId = lambda.event.params.userId;

        lambda.context.succeed(HttpSucceedResponse(
            await PropertiesModel.deleteUserfromProperty(propertyId, userId)
        ));
    });
}

export async function verifyPropertiesFunction (event, context) {
    return new Middleware().run(event, context, ['admin']).then(async lambda => {
        const verifiedProperties = await PropertiesModel.verify(
            lambda.event.body.properties, lambda.event.params.userId
        );

        if (verifiedProperties) {
            lambda.context.succeed(HttpSucceedResponse(verifiedProperties));
        } else {
            lambda.context.succeed(HttpFailureResponse({message: 'User not allowd'}, 401));
        }
    });
}

export async function deploysProductsToProperty (event, context) {
    return new Middleware().run(event, context, ['admin']).then(async lambda => {
        const propertyId = lambda.event.params.id;
        const products = lambda.event.body;

        try {
            const response = await S3.putObject( {
                Bucket: 'stores.altpaca.com',
                Key: `${propertyId}.json`,
                Body: products
            }).promise();

            console.log('response', response)

            if (response) {
                lambda.context.succeed(HttpSucceedResponse(response));
            } else {
                lambda.context.succeed(HttpFailureResponse({message: 'Error'}, 403));
            }
        } catch (err) {
            console.log(err)
            lambda.context.succeed(HttpFailureResponse({message: err}, 403));
        }
    });
}
