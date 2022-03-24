import { Middleware }  from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { AdminsDto }     from './admins.dto';
import { Admins }        from './admins.model';
import * as mongoose   from 'mongoose';

let AdminsModel = new AdminsDto(Admins);

export async function getAdminsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        const users = await AdminsModel.findAll();
        lambda.context.succeed(HttpSucceedResponse(users));
    });
}

export async function getPropertyAdminsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        const propertyId = lambda.event.params.id;
        const users = await AdminsModel.findAll({ properties: propertyId });
        lambda.context.succeed(HttpSucceedResponse(users));
    });
}

export async function getAdminsPropertiesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        const users = await AdminsModel.findAllWithProperties();
        lambda.context.succeed(HttpSucceedResponse(users));
    });
}

export async function createAdminsFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        try {
            const newAdmin = await AdminsModel.create(event.body);
            newAdmin.role = newAdmin.role ? newAdmin.role : 'admin';
            const savedAdmin = await newAdmin.save();
            lambda.context.succeed(HttpSucceedResponse(await savedAdmin.serialize()));
        } catch (err) {
            lambda.context.succeed(HttpFailureResponse("Attempt to create a duplicated user.", 400));
        }
    });
}

export async function updateAdminsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await AdminsModel.update(lambda.event.params.id, lambda.event.body)));
    });
}

export async function updateAdminPasswordFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {

        lambda.context.succeed(HttpSucceedResponse(
            await AdminsModel.updatePassword(lambda.event.params.id, lambda.event.body.password))
        );
    });
}

export async function deleteAdminsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await AdminsModel.delete(lambda.event.params.id)));
    });
}
