import { Middleware }  from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { PaymentMethodsDto }     from './payment-methods.dto';
import { PaymentMethods }        from './payment-methods.model';
import AWS from 'aws-sdk';
import { uuid } from 'uuidv4';
const s3 = new AWS.S3();

let PaymentMethodsModel = new PaymentMethodsDto(PaymentMethods);

export async function getPaymentMethodsFunction (event, context) {
    return new Middleware().run(event, context, []).then(async lambda => {
        const PaymentMethods = await PaymentMethodsModel.findAll({ propertyId: lambda.event.params.propertyId });
        lambda.context.succeed(HttpSucceedResponse(PaymentMethods));
    });
}

export async function createPaymentMethodsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        try {
            const newPaymentsMethods = await PaymentMethodsModel.create({
                ...event.body,
                propertyId: lambda.event.params.propertyId
            });

            const savedPaymentMethods = await newPaymentsMethods.save();
            lambda.context.succeed(HttpSucceedResponse(await savedPaymentMethods));
        } catch (err) {
            lambda.context.succeed(HttpFailureResponse("Error when creating a PaymentMethods." + err, 400));
        }
    });
}

export async function updatePaymentMethodsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await PaymentMethodsModel.update(lambda.event.params.id, lambda.event.body)));
    });
}

export async function deletePaymentMethodsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await PaymentMethodsModel.delete(lambda.event.params.id)));
    });
}


