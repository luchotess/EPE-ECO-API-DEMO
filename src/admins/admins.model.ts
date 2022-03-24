import bcrypt from 'bcryptjs';
import * as mongoose from 'mongoose';

const AdminSchema = mongoose.Schema({
    name: String,
    email: {
        type: String
    },
    password: String,
    role: String,
    properties: [{type: String, ref: 'Properties'}],
    dateCreated: Date
});

AdminSchema.methods.serialize = function () {
    return {
        _id: this._id,
        email: this.email,
        name: this.name,
        properties: this.properties,
        role: this.role,
        dateCreated: this.dateCreated
    };
};

AdminSchema.pre('save', async function (next) {
    if (this.isNew) {
        await this.hashPassword();
    }
    next();
});

AdminSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

AdminSchema.methods.hashPassword = async function (password = null) {
    this.password = await bcrypt.hash(password ? password : this.password, 10);
};

AdminSchema.methods.updatePassword = async function (password) {
    console.log(password);

    await this.hashPassword(password)

    return this.save();
};

AdminSchema.pre('findOneAndUpdate', async function (next) {
    const data = this.getUpdate();

    if (data.password) {
        throw new Error(`Can't change password on update process.`);
    }
    next();
});

export const Admins = mongoose.model('Admins', AdminSchema);
