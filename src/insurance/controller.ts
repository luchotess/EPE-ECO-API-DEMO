import { Middleware }  from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { InsuranceDto }     from './insuranceDto';
import { Insurance }        from './insurance.model';
import AWS from 'aws-sdk';
import { uuid } from 'uuidv4';
const s3 = new AWS.S3();

let InsuranceModel = new InsuranceDto(Insurance);

export async function getInsuranceFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        const Insurance = await InsuranceModel.findAll({ propertyId: lambda.event.params.propertyId });
        lambda.context.succeed(HttpSucceedResponse(Insurance));
    });
}

export async function createInsuranceFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        try {
            const newInsurance = await InsuranceModel.create({
                ...event.body,
                datePlaced: new Date(),
                propertyId: lambda.event.params.propertyId
            });

            const savedInsurance = await newInsurance.save();
            lambda.context.succeed(HttpSucceedResponse(await savedInsurance));
        } catch (err) {
            lambda.context.succeed(HttpFailureResponse("Error when creating a Insurance." + err, 400));
        }
    });
}

export async function updateInsuranceFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await InsuranceModel.update(lambda.event.params.id, lambda.event.body)));
    });
}

export async function deleteInsuranceFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await InsuranceModel.delete(lambda.event.params.id)));
    });
}




