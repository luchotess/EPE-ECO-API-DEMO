import { Middleware }  from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { SubscribersDto }     from './subscribersDto';
import { Subscribers }        from './subscribers.model';
import AWS from 'aws-sdk';
import { uuid } from 'uuidv4';
const s3 = new AWS.S3();

let SubscribersModel = new SubscribersDto(Subscribers);

export async function getSubscribersFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        const Subscribers = await SubscribersModel.findAll({ propertyId: lambda.event.params.propertyId });
        lambda.context.succeed(HttpSucceedResponse(Subscribers));
    });
}

export async function createSubscribersFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        try {
            const newSubscribers = await SubscribersModel.create({
                ...event.body,
                datePlaced: new Date(),
                propertyId: lambda.event.params.propertyId
            });

            const savedSubscribers = await newSubscribers.save();
            lambda.context.succeed(HttpSucceedResponse(await savedSubscribers));
        } catch (err) {
            lambda.context.succeed(HttpFailureResponse("Error when creating a Subscribers." + err, 400));
        }
    });
}

export async function updateSubscribersFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await SubscribersModel.update(lambda.event.params.id, lambda.event.body)));
    });
}

export async function deleteSubscribersFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await SubscribersModel.delete(lambda.event.params.id)));
    });
}


