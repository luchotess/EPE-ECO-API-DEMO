import { Middleware }  from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { CompaniesDto }     from './companies.dto';
import { Companies }        from './companies.model';

let CompaniesModel = new CompaniesDto(Companies);

export async function getCompaniesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        const Companies = await CompaniesModel.findAll();
        lambda.context.succeed(HttpSucceedResponse(Companies));
    });
}

export async function createCompaniesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        try {
            const newCompanies = await CompaniesModel.create(event.body);
            const savedCompanies = await newCompanies.save();
            lambda.context.succeed(HttpSucceedResponse(await savedCompanies));
        } catch (err) {
            lambda.context.succeed(HttpFailureResponse("Error when creating a Company.", 400));
        }
    });
}

export async function updateCompaniesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await CompaniesModel.update(lambda.event.params.id, lambda.event.body)));
    });
}

export async function deleteCompaniesFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await CompaniesModel.delete(lambda.event.params.id)));
    });
}
