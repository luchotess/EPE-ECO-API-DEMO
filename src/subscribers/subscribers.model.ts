import * as mongoose from 'mongoose';

const SubscribersSchema = mongoose.Schema({
  propertyId: String,
  id: String,
  email: String,
  datePlaced: String,
});

export const Subscribers = mongoose.model('Subscribers', SubscribersSchema);
