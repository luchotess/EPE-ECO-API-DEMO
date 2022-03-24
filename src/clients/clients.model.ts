import * as mongoose   from 'mongoose';

const ClientsSchema = mongoose.Schema({
    name: String,
    email: String,
    details: Object,
    companyId: String,
    properties: [String],
    dateCreated: Date,
});

export const Clients = mongoose.model('Clients', ClientsSchema);
