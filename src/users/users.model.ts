import bcrypt from 'bcryptjs';
import * as mongoose from 'mongoose';

const usersSchema = mongoose.Schema({
    name: String,
    lastname: String,
    email: {
        type: String
    },
    password: String,
    phone: String,
    store: String,
    data: Object,
    addresses: [Object],
    defaultShippingAddress: Number,
    defaultInvoiceAddress: Number,
    dateCreated: Date
});

usersSchema.methods.serialize = function () {
    return {
        _id: this._id,
        email: this.email,
        name: this.name,
        lastname: this.lastname,
        store: this.store,
        data: this.data,
        phone: this.phone,
        addresses: this.addresses,
        defaultShippingAddress: this.defaultShippingAddress,
        defaultInvoiceAddress: this.defaultInvoiceAddress,
        dateCreated: this.dateCreated
    };
};

usersSchema.pre('save', async function (next) {
    if (this.isNew) {
        await this.hashPassword();
    }
    next();
});

usersSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

usersSchema.methods.hashPassword = async function (password = null) {
    this.password = await bcrypt.hash(password ? password : this.password, 10);
};

usersSchema.methods.updatePassword = async function (password) {
    await this.hashPassword(password)
    return this.save();
};

usersSchema.pre('findOneAndUpdate', async function (next) {
    const data = this.getUpdate();

    if (data.password) {
        throw new Error(`Can't change password on update process.`);
    }
    next();
});

export const Users = mongoose.model('Users', usersSchema);
