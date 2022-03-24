const defaultSuccessCode = 200;
const defaultFailureCode = 400;

export const defaultHeaders = {
    'Access-Control-Allow-Origin'     : '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

class responseBody {
    constructor(public ok: boolean,
                public code: number,
                public data: any) {}
}

export function HttpSucceedResponse (body = {}, statusCode = defaultSuccessCode, headers = defaultHeaders) {
    return {
        statusCode,
        headers,
        body: JSON.stringify(new responseBody(true, statusCode, body))
    };
}

export function HttpFailureResponse (body = {}, statusCode = defaultFailureCode, headers = defaultHeaders) {
    return {
        statusCode,
        headers,
        body: JSON.stringify(new responseBody(false, statusCode, body))
    };
}
