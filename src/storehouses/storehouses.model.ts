import * as mongoose from 'mongoose';

const StorehousesSchema = mongoose.Schema({
  propertyId: String,
  name: String,
  location: String,
  products: [Object]
});

export const Storehouses = mongoose.model('Storehouses', StorehousesSchema);
