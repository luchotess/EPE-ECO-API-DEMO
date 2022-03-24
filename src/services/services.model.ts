import * as mongoose from 'mongoose';

const ServicesSchema = mongoose.Schema({
  shippingAddress : Object,
  serviceData     : Object,
  service         : Object,
  referenceCode   : String,
  storeName       : String,
  propertyId      : String,
  user            : String,
  datePlaced      : Date,
  status          : String
});

export const Services = mongoose.model('Services', ServicesSchema);
