import * as jwt        from 'jsonwebtoken';
import { JWT_SECRET } from "./database/config";
import {HttpFailureResponse} from "./utils";

function checkUserRole (event, requiredRoles) {
    const decodedUser = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), JWT_SECRET);
    event.user = decodedUser ? decodedUser : null;

    return requiredRoles.includes(event.user.role);
}

export class Middleware {

    constructor(private isVerifyFunction: boolean = false) {}

    private parse_body(event: any) {
        if (event.body) {
            return JSON.parse(event.body);
        }
        return {}
    }

    async run(event: any, context:any, requiredRoles: string[] = [], ...args) {
        event.body = this.parse_body(event);
        event.params = Object.assign( {}, event.queryStringParameters);

        if (!this.isVerifyFunction && requiredRoles.length > 0 && !checkUserRole(event, requiredRoles)) {
            console.log(`You need a ${requiredRoles} role. You have ${event.user.role} role.`);
            context.succeed(HttpFailureResponse('User not allowed', 403));
        }

        if (event.pathParameters){
            event.params = Object.assign( event.pathParameters, event.params);
        }

        return {
            event,
            context
        };
    }
}
