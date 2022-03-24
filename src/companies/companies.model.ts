import * as mongoose   from 'mongoose';

const CompaniesSchema = mongoose.Schema({
    name: String,
    email: String,
    details: Object,
    companyId: String,
    properties: [String],
    dateCreated: Date,
});

export const Companies = mongoose.model('Companies', CompaniesSchema);
