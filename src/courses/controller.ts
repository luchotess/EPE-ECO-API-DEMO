import * as https from "https";

const aws = require('aws-sdk');
const ses = new aws.SES({region: 'us-east-1'});

import { Middleware }  from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { CoursesDto }     from './courses.dto';
import { Courses }                 from './courses.model';
import { renderEmailCourseOrder } from "./sendEmail";

let CoursesModel = new CoursesDto(Courses);

export async function getCoursesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        const Courses = await CoursesModel.findAll({ propertyId: lambda.event.params.propertyId });
        lambda.context.succeed(HttpSucceedResponse(Courses));
    });
}

export async function getUserCoursesFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        const Courses = await CoursesModel.findAll({
            propertyId: lambda.event.params.propertyId,
            user: lambda.event.params.userId
        });
        lambda.context.succeed(HttpSucceedResponse(Courses));
    });
}
export async function getBookingCoursesFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        const Courses = await CoursesModel.findAll({
            propertyId: lambda.event.params.propertyId,
        });
        lambda.context.succeed(HttpSucceedResponse(Courses));
    });
}

export async function placeCourseOrderFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        try {
            const newCourses = await CoursesModel.create({
                ...event.body,
                status: 'Orden Recibida',
                datePlaced: new Date(),
                propertyId: lambda.event.params.propertyId
            });

            const savedOrder = await newCourses.save();

            if (savedOrder) {
                const response = await ses.sendEmail(renderEmailCourseOrder({ ...event.body, datePlaced: new Date() })).promise();

                if (response) {
                    console.log('email sent')
                    lambda.context.succeed(HttpSucceedResponse(savedOrder));
                }
            }
        } catch (err) {
            lambda.context.succeed(HttpFailureResponse("Error when creating a Courses." + err, 400));
        }
    });
}

export async function updateCoursesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await CoursesModel.update(lambda.event.params.id, lambda.event.body)));
    });
}

export async function deleteCoursesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await CoursesModel.delete(lambda.event.params.id)));
    });
}
