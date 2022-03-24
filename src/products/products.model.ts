import * as mongoose from 'mongoose';

const ProductsSchema = mongoose.Schema({
    propertyId : String,
    url        : String,
    title      : String,
    featured   : Boolean,
    description: String,
    specs      : String,
    labels     : [Object],
    price      : {
        old   : Number,
        actual: Number,
        offer : Number
    },
    variations : [
        {
            title      : String,
            images     : Object,
            stock      : Number,
            description: String,
            specs      : String,
            price      : {
                old   : Number,
                actual: Number,
                offer : Number
            }
        }
    ],
    categories : [Object],
    meta       : Object,
    isBundle   : Boolean,
    bundleItems: [Object],
    images     : Object
});

export const Products = mongoose.model('Products', ProductsSchema);
