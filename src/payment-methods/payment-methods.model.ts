import * as mongoose from 'mongoose';

const PaymentMethodsSchema = mongoose.Schema({
  propertyId: String,
  url: String,
  name: String,
  code: String,
  type: String,
  instructions: String,
  icon: String,
  disabled: Boolean,
});

export const PaymentMethods = mongoose.model('PaymentMethods', PaymentMethodsSchema);
