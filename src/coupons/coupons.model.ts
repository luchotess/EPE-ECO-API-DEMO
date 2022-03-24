import * as mongoose from 'mongoose';

const CouponsSchema = mongoose.Schema({
  propertyId: String,
  name: String,
  code: String,
  type: String,
  discount: String,
});

export const Coupons = mongoose.model('Coupons', CouponsSchema);
