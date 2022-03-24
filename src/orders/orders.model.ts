import * as mongoose from 'mongoose';

const OrdersSchema = mongoose.Schema({
  shippingAddress   : Object,
  cart              : [Object],
  referenceCode     : String,
  storeName         : String,
  paymentMethod     : String,
  propertyId        : String,
  user              : String,
  totalString       : String,
  shippingCost      : Number,
  shippingCostString: String,
  discountString    : String,
  taxesString       : String,
  total             : Number,
  discount          : Number,
  taxes             : Number,
  datePlaced        : Date,
  status            : String
});

export const Orders = mongoose.model('Orders', OrdersSchema);
