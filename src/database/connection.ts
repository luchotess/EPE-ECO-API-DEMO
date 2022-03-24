import mongoose   from 'mongoose';
import { DB_URL } from './config';

mongoose.Promise = global.Promise;

export const connectDb = () => {
    return mongoose.connect(DB_URL);
};
