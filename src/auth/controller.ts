import { Middleware }  from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse, defaultHeaders } from '../utils';
import { AdminsDto }     from '../admins/admins.dto';
import { UsersDto } from "../users/users.dto";
import { Admins }        from '../admins/admins.model';
import { Users } from "../users/users.model";
import * as jwt        from 'jsonwebtoken';
import { JWT_SECRET } from "../database/config";

let AdminModel = new AdminsDto(Admins);
let UsersModel = new UsersDto(Users);

export async function login (event, context) {
    return new Middleware(true).run(event, context).then(async lambda => {
        const userFound = await AdminModel.findOneWithProperties({ email: event.body.email });
        const passwordMatch = await userFound.validatePassword(event.body.password);

        if (userFound && passwordMatch) {
            const payload = { token: await jwt.sign(await userFound.serialize(), JWT_SECRET) };

            lambda.context.succeed({
                headers: defaultHeaders,
                body: JSON.stringify(payload)
            });
        }

        lambda.context.succeed(HttpFailureResponse('Bad credentials', 403));
    });
}

export async function storeLogin (event, context) {

    return new Middleware(true).run(event, context).then(async lambda => {
        try {
            const userFound = await UsersModel.findOneWithProperties({
                email: event.body.email,
                store: lambda.event.params.storeId
            });

            const passwordMatch = userFound ? await userFound.validatePassword(event.body.password) : false;

            if (userFound && passwordMatch) {
                const payload = { token: await jwt.sign(await userFound.serialize(), JWT_SECRET) };

                lambda.context.succeed({
                    headers: defaultHeaders,
                    body: JSON.stringify(payload)
                });
            }

            lambda.context.succeed(HttpFailureResponse('Bad credentials', 403));
        } catch (e) {
            console.log(e);
            lambda.context.succeed(HttpFailureResponse('Bad credentials', 403));
        }
    });
}

export async function logout (event, context) {
    return new Middleware(true).run(event, context).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse('User logged out'));
    });
}

export async function verify (event, context) {
    return new Middleware(true).run(event, context).then(async lambda => {
        const token = event.authorizationToken.replace('Bearer ', '');
        const methodArn = event.methodArn;

        if (!token || !methodArn) {
            lambda.context.succeed(HttpFailureResponse('Bad credentials', 403));
        }

        try {
            const decodedUser = jwt.verify(token, JWT_SECRET);
            const user = await AdminModel.findOne({email: decodedUser.email});
            event.user = user;

            if (user && user._id) {
                lambda.context.succeed(generateAuthResponse(user._id, 'Allow', '*'));
            } else {
                lambda.context.succeed(generateAuthResponse(user._id, 'Deny', methodArn));
            }
        } catch {
            lambda.context.succeed(generateAuthResponse(0, 'Deny', methodArn));
        }
    });
}

function generateAuthResponse(principalId, effect, methodArn) {
    const policyDocument = generatePolicyDocument(effect, methodArn);

    return {
        principalId,
        policyDocument
    };
}

function generatePolicyDocument(effect, methodArn) {
    if (!effect || !methodArn) return null;

    const policyDocument = {
        Version: '2012-10-17',
        Statement: [
            {
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: methodArn
            }
        ]
    };

    return policyDocument;
}
