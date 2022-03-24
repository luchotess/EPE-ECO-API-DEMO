import * as mongoose from 'mongoose';
import {Admins} from "../admins/admins.model";

const PropertiesSchema = mongoose.Schema({
        name: String,
        url: String,
        type: String,
        clientId: String,
        dateCreated: Date,
        categories: [Object],
        labels: [Object]
    },
    {
        toJSON: {
            virtuals: true
        }
    }
);

PropertiesSchema.methods.serialize = function () {
    return {
        _id: this._id,
        name: this.name,
        url: this.url,
        type: this.type,
        clientId: this.clientId,
        dateCreated: this.dateCreated,
        categories: this.categories,
        labels: this.labels
    }
}

export const Properties = mongoose.model('Properties', PropertiesSchema);
