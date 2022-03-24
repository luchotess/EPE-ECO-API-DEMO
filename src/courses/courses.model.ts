import * as mongoose from 'mongoose';

const CoursesSchema = mongoose.Schema({
  shippingAddress : Object,
  courseData      : Object,
  course          : Object,
  referenceCode   : String,
  storeName       : String,
  propertyId      : String,
  user            : String,
  datePlaced      : Date,
  status          : String
});

export const Courses = mongoose.model('Courses', CoursesSchema);
