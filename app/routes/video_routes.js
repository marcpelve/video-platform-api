// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for videos
const Video = require('../models/video')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else

// this is middleware that will remove blank fields from `req.body`, e.g.
// { video: { title: '', text: 'foo' } } -> { video: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /videos
router.get('/videos', (req, res, next) => {
  Video.find()
    .then(videos => {
      // `videos` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return videos.map(video => video.toObject())
    })
    // respond with status 200 and JSON of the videos
    .then(videos => res.status(200).json({ videos: videos }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /videos/5a7db6c74d55bc51bdf39793
router.get('/videos/:id', (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Video.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "video" JSON
    .then(video => res.status(200).json({ video: video.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /videos
router.post('/videos', (req, res, next) => {
  Video.create(req.body.video)
    // respond to succesful `create` with status 201 and JSON of new "video"
    .then(video => {
      res.status(201).json({ video: video.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error video and the `res` object so that it
    // can send an error video back to the client
    .catch(next)
})

// UPDATE
// PATCH /videos/5a7db6c74d55bc51bdf39793
router.patch('/videos/:id', removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  Video.findById(req.params.id)
    .then(handle404)
    .then(video => {
      // pass the result of Mongoose's `.update` to the next `.then`
      return video.updateOne(req.body.video)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /videos/5a7db6c74d55bc51bdf39793
router.delete('/videos/:id', (req, res, next) => {
  // if (req.user.role === 'admin') {
  //   Video.findById(req.params.id)
  //     .then(handle404)
  //     .then(video => {
  //       video.deleteOne()
  //     })
  //     .then(() => res.sendStatus(204))
  //     .catch(next)
  // }
  Video.findById(req.params.id)
    .then(handle404)
    .then(video => {
      video.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
