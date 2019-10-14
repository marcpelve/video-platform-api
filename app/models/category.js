const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  video: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }]
}, {
  timestamps: true
})

module.exports = mongoose.model('Category', categorySchema)
