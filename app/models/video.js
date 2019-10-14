const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: [{
    type: String,
    enum: ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Historical', 'Horror', 'Political', 'Romance', 'Science fiction', 'Thriller', 'Western'],
    required: true
  }]
}, {
  timestamps: true
})

module.exports = mongoose.model('Video', videoSchema)
