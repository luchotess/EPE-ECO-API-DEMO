import { Middleware }  from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { StorehousesDto }     from './storehousesDto';
import { Storehouses }        from './storehouses.model';
import AWS from 'aws-sdk';
import { uuid } from 'uuidv4';
const s3 = new AWS.S3();

let StorehousesModel = new StorehousesDto(Storehouses);

export async function getStorehousesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        const Storehouses = await StorehousesModel.findAll({ propertyId: lambda.event.params.propertyId });
        lambda.context.succeed(HttpSucceedResponse(Storehouses));
    });
}

export async function createStorehousesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        try {
            const newStorehouses = await StorehousesModel.create({
                ...event.body,
                propertyId: lambda.event.params.propertyId
            });

            const savedStorehouses = await newStorehouses.save();
            lambda.context.succeed(HttpSucceedResponse(await savedStorehouses));
        } catch (err) {
            lambda.context.succeed(HttpFailureResponse("Error when creating a Storehouses." + err, 400));
        }
    });
}

export async function updateStorehousesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await StorehousesModel.update(lambda.event.params.id, lambda.event.body)));
    });
}

export async function deleteStorehousesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await StorehousesModel.delete(lambda.event.params.id)));
    });
}


