import { Middleware }  from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import {Properties} from "../properties/properties.model";
import {PropertiesDto} from "../properties/properties.dto";

let PropertiesModel = new PropertiesDto(Properties);

export async function uploadFile (event, context) {
    return new Middleware(true).run(event, context, ['admin', 'superadmin']).then(async lambda => {
        // Get Property bucket S3
        const propertyId = lambda.event.params.propertyId;
        const bucketS3 = '';

        // Save file to bucket S3
        // ...

        lambda.context.succeed(HttpSucceedResponse('All good', 200));
    });
}

export async function removeFile (event, context) {
    return new Middleware(true).run(event, context, ['admin', 'superadmin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse('All good', 200));
    });
}

export async function saveContent (event, context) {
    return new Middleware(true).run(event, context, ['admin', 'superadmin']).then(async lambda => {
        const propertyId = lambda.event.params.propertyId;
        const data = lambda.event.body.data;
        const bucketS3 = '';

        // Save data object as a file to S3 bucket

        lambda.context.succeed(HttpSucceedResponse('All good', 200));
    });
}

export async function getContent (event, context) {
    return new Middleware(true).run(event, context).then(async lambda => {
        const propertyId = lambda.event.params.propertyId;
        const bucketS3 = '';

        // get json file from private S3 bucket

        lambda.context.succeed(HttpSucceedResponse('All good', 200));
    });
}
