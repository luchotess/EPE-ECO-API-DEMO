import { Middleware }                               from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { ProductsDto }                              from './products.dto';
import { Products }                                 from './products.model';
import AWS                                          from 'aws-sdk';
import { uuid }                                     from 'uuidv4';

const s3 = new AWS.S3();
import { formParser }                               from './formParser';
import Jimp                                         from 'jimp';

let ProductsModel = new ProductsDto(Products);

export async function getProductsFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        const Products = await ProductsModel.findAll({ propertyId: lambda.event.params.propertyId });
        lambda.context.succeed(HttpSucceedResponse(Products));
    });
}

export async function createProductsFunction (event, context) {
    return new Middleware().run(event, context, []).then(async lambda => {
        try {
            const newProduct = await ProductsModel.create({
                ...event.body,
                propertyId: lambda.event.params.propertyId
            });

            const savedProduct = await newProduct.save();
            lambda.context.succeed(HttpSucceedResponse(await savedProduct));
        } catch (err) {
            lambda.context.succeed(HttpFailureResponse('Error when creating a Products.' + err, 400));
        }
    });
}

export async function updateProductsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await ProductsModel.update(lambda.event.params.id, lambda.event.body)));
    });
}

export async function deleteProductsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await ProductsModel.delete(lambda.event.params.id)));
    });
}

const uploadToS3 = (bucket, key, buffer, mimeType) => {
    console.log('uploading to S3');
    return new Promise((resolve, reject) => {
        s3.upload(
            { Bucket: bucket, Key: key, Body: buffer, ContentType: mimeType },
            function (err, data) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                resolve(data);
            });
    });
};

const resize = (buffer, mimeType, width) =>
    new Promise((resolve, reject) => {
        Jimp.read(buffer)
            .then(image => image.resize(width, Jimp.AUTO).quality(70).getBufferAsync(mimeType))
            .then(resizedBuffer => resolve(resizedBuffer))
            .catch(error => reject(error));
    });

const getErrorMessage = message => ({ statusCode: 500, body: JSON.stringify(message) });

export async function uploadPhoto (event) {
    return await getUploadURL(event)
}

AWS.config.update({ region: process.env.REGION || 'us-east-1' })

const getUploadURL = async (event) => {
    const MAX_SIZE = 4000000;
    const formData: any = await formParser(event, MAX_SIZE);
    const file = formData.files[0];

    const s3Params = {
        Bucket: 'media.veetcuna.com/stores/epe/products',
        Key:  file.filename,
        ACL: 'public-read',
    }
    return new Promise((resolve, reject) => {
        let uploadURL = s3.getSignedUrl('putObject', s3Params)
        resolve({
            "statusCode": 200,
            "isBase64Encoded": false,
            "headers": { "Access-Control-Allow-Origin": "*" },
            "body": JSON.stringify({
                "uploadURL": uploadURL,
                "photoFilename": file.filename
            })
        })
    })
};


