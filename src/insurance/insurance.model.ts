import * as mongoose from 'mongoose';

const InsuranceSchema = mongoose.Schema({
  propertyId: String,
  id: String,
  name: String,
  insurance: String,
  email: String,
  dni: String,
  datePlace: String,
});

export const Insurance = mongoose.model('Insurance', InsuranceSchema);
