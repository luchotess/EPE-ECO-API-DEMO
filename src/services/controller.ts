const aws = require('aws-sdk');
const ses = new aws.SES({ region: 'us-east-1' });

import { Middleware }                               from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { ServicesDto }                              from './services.dto';
import { Services }                                 from './services.model';
import { renderEmailCourseOrder }                   from "./sendEmail";

let ServicesModel = new ServicesDto(Services);

export async function getServicesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        const Services = await ServicesModel.findAll({ propertyId: lambda.event.params.propertyId });
        lambda.context.succeed(HttpSucceedResponse(Services));
    });
}

export async function getUserServicesFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        const Services = await ServicesModel.findAll({
            propertyId: lambda.event.params.propertyId,
            user      : lambda.event.params.userId
        });
        lambda.context.succeed(HttpSucceedResponse(Services));
    });
}

export async function getBookingServicesFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        const Services = await ServicesModel.findAll({
            propertyId: lambda.event.params.propertyId,
        });
        lambda.context.succeed(HttpSucceedResponse(Services));
    });
}

export async function placeCourseOrderFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        try {
            const newServices = await ServicesModel.create({
                ...event.body,
                status    : 'Orden Recibida',
                datePlaced: new Date(),
                propertyId: lambda.event.params.propertyId
            });

            const savedOrder = await newServices.save();

            if (savedOrder) {
                const response = await ses.sendEmail(renderEmailCourseOrder({
                    ...event.body,
                    datePlaced: new Date()
                })).promise();

                if (response) {
                    console.log('email sent')
                    lambda.context.succeed(HttpSucceedResponse(savedOrder));
                }
            }
        } catch (err) {
            lambda.context.succeed(HttpFailureResponse("Error when creating a Services." + err, 400));
        }
    });
}

export async function updateServicesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await ServicesModel.update(lambda.event.params.id, lambda.event.body)));
    });
}

export async function deleteServicesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await ServicesModel.delete(lambda.event.params.id)));
    });
}
