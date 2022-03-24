import { Middleware }  from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { CouponsDto }     from './coupons.dto';
import { Coupons }        from './coupons.model';
import AWS from 'aws-sdk';
import { uuid } from 'uuidv4';
const s3 = new AWS.S3();

let CouponsModel = new CouponsDto(Coupons);

export async function getCouponsFunction (event, context) {
    return new Middleware().run(event, context, []).then(async lambda => {
        const Coupons = await CouponsModel.findAll({ propertyId: lambda.event.params.propertyId });
        lambda.context.succeed(HttpSucceedResponse(Coupons));
    });
}

export async function createCouponsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        try {
            const newPaymentsMethods = await CouponsModel.create({
                ...event.body,
                propertyId: lambda.event.params.propertyId
            });

            const savedCoupons = await newPaymentsMethods.save();
            lambda.context.succeed(HttpSucceedResponse(await savedCoupons));
        } catch (err) {
            lambda.context.succeed(HttpFailureResponse("Error when creating a Coupons." + err, 400));
        }
    });
}

export async function updateCouponsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await CouponsModel.update(lambda.event.params.id, lambda.event.body)));
    });
}

export async function deleteCouponsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await CouponsModel.delete(lambda.event.params.id)));
    });
}

