import { Middleware }  from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { ClientsDto }     from './clients.dto';
import { Clients }        from './clients.model';

let ClientsModel = new ClientsDto(Clients);

export async function getClientsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        const Clients = await ClientsModel.findAll();
        lambda.context.succeed(HttpSucceedResponse(Clients));
    });
}

export async function createClientsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        try {
            const newClients = await ClientsModel.create(event.body);
            const savedClients = await newClients.save();
            lambda.context.succeed(HttpSucceedResponse(await savedClients));
        } catch (err) {
            lambda.context.succeed(HttpFailureResponse("Error when creating a clients.", 400));
        }
    });
}

export async function updateClientsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await ClientsModel.update(lambda.event.params.id, lambda.event.body)));
    });
}

export async function deleteClientsFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await ClientsModel.delete(lambda.event.params.id)));
    });
}
