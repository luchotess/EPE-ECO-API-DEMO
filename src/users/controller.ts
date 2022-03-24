import { sendWelcomeEmail }                         from '../email/bundleEmail';
import { Middleware }                               from '../Middleware';
import { PropertiesDto }                            from '../properties/properties.dto';
import { Properties }                               from '../properties/properties.model';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { UsersDto }                                 from './users.dto';
import { Users }                                    from './users.model';
import { JWT_SECRET }                               from "../database/config";
import * as jwt                                     from 'jsonwebtoken';

let UsersModel = new UsersDto(Users);
let PropertiesModel = new PropertiesDto(Properties);

export async function getUsersFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        const users = await UsersModel.findAll();
        lambda.context.succeed(HttpSucceedResponse(users));
    });
}

export async function getUsersFromPropertyFunction (event, context) {
    return new Middleware().run(event, context, ['admin']).then(async lambda => {
        const users = await UsersModel.findAll({ store: lambda.event.params.storeId });
        lambda.context.succeed(HttpSucceedResponse(users));
    });
}

export async function getOneUserFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        const users = await UsersModel.findOne({_id: lambda.event.params.id});
        lambda.context.succeed(HttpSucceedResponse(users));
    });
}

export async function getPropertyUsersFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        const propertyId = lambda.event.params.id;
        const users = await UsersModel.findAll({ properties: propertyId });
        lambda.context.succeed(HttpSucceedResponse(users));
    });
}

export async function getUsersPropertiesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        const users = await UsersModel.findAllWithProperties();
        lambda.context.succeed(HttpSucceedResponse(users));
    });
}

export async function createUsersFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        try {
            const userPayload = event.body;

            const foundUserInStore = await UsersModel.findOne({
                email: userPayload.email,
                store: userPayload.store
            })

            const foundUserWithDNI = await UsersModel.findOne( {
                data: {
                    dni: userPayload.data.dni
                }
            });

            if (foundUserInStore || foundUserWithDNI) {
                throw new Error('User is already registered.');
            }

            const newUser = await UsersModel.create(event.body);
            const savedUser = await newUser.save();
            const payload = await jwt.sign(await savedUser.serialize(), JWT_SECRET);
            const storeName = await PropertiesModel.findOne({ _id: userPayload.store });
            const emailSent = await sendWelcomeEmail(savedUser, storeName.name);

            if (emailSent) {
                lambda.context.succeed(HttpSucceedResponse({
                    user: await savedUser.serialize(),
                    token: payload
                }));
            }
        } catch (err) {
            console.log(err);
            lambda.context.succeed(HttpFailureResponse(err.message, 400));
        }
    });
}

export async function updateUsersFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        const updatedUser = await UsersModel.update(lambda.event.params.id, lambda.event.body);
        const payload = {
            user: updatedUser.serialize(),
            token: await jwt.sign(await updatedUser.serialize(), JWT_SECRET) };

        lambda.context.succeed(HttpSucceedResponse(payload));
    });
}

export async function updateUserPasswordFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {

        lambda.context.succeed(HttpSucceedResponse(
            await UsersModel.updatePassword(lambda.event.params.id, lambda.event.body.password))
        );
    });
}

export async function deleteUserFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await UsersModel.delete(lambda.event.params.id)));
    });
}
