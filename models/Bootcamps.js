const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const DevstoreSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, 'Please add the name'],
        unique: true,
        trim: true,
        maxlength:[50, 'Name cannot be more than 50 chars']
    },

    //URL friendly verzija imena
    slug:String,
    description:{
        type: String,
        required:[true, 'Please add description'],
        maxlength:[500, 'Description lenght is 500 chars']
    },

    website: {
        type: String,
        match: [
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
          'Please use a valid URL with HTTP or HTTPS'
        ]
      },
      phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
      },
      email: {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      address: {
        type: String,
        required: [true, 'Please add an address']
      },
      location: {
        // GeoJSON Point
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
      },
      careers: {
        // Array of strings
        type: [String],
        required: true,
        enum: [
          'Web Development',
          'Mobile Development',
          'UI/UX',
          'Data Science',
          'Business',
          'Other'
        ]
      },
      averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
      },
      averageCost: Number,
      photo: {
        type: String,
        default: 'no-photo.jpg'
      },
      housing: {
        type: Boolean,
        default: false
      },
      jobAssistance: {
        type: Boolean,
        default: false
      },
      jobGuarantee: {
        type: Boolean,
        default: false
      },
      acceptGi: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      } 

}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

//Slugs
DevstoreSchema.pre('save', function(next){
  this.slug = slugify(this.name, { lower: true });
  next();
})

//Geo code
DevstoreSchema.pre('save', async function(next){
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'point',
    coordinates:[loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street:loc[0].streetName,
    city:loc[0].city,
    state:loc[0].stateCode,
    zipcode:loc[0].zipcode,
    country:loc[0].countryCode
  }
  this.address = undefined;
  next();
});

//Cascade delete courses with his bootcamp
DevstoreSchema.pre('remove', async function (next){
  await this.model('Course').deleteMany({ bootcamp: this._id });
  next();
});

// Populate courses by bootcamp
DevstoreSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp', 
  justOne: false
});


module.exports = mongoose.model('Bootcamp', DevstoreSchema)