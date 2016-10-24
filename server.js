// BASE SETUP ==================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var loki = require('lokijs');

// configure app to use bodyParser(), this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// in-memory database: lokijs
var db = new loki('bear.json');
var bear = db.addCollection('bear');

// ROUTES FOR OUR API ==========================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function (req, res, next) {
  // do logging
  console.log('Something is happening.');
  next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// on routes that end in /bears
// ----------------------------------------------------
router.route('/bears')

  // create a bear (accessed at POST http://localhost:8080/api/bears)
  .post(function (req, res) {
    let name = req.body.name;
    bear.insert({ name: name });
    res.json({ message: name + ' added successfully!' });
  })

  // get all the bears (accessed at GET http://localhost:8080/api/bears)
  .get(function (req, res) {
    res.json(bear.find());
  });

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
router.route('/bears/:bear_id')

  // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
  .get(function (req, res) {
    let bear_id = req.params.bear_id;
    res.json(bear.find({ '$loki': parseInt(bear_id) }));
  })

  // update the bear with this id (accessed at PUT http://localhost:8080/api/bears/:bear_id)
  .put(function (req, res) {

    // use our bear model to find the bear we want
    let bear_id = req.params.bear_id;
    let bear_found = bear.find({ '$loki': parseInt(bear_id) });

    // update model's property
    bear_found[0].name = req.body.name;

    // update db collection
    bear.update(bear_found);

    // send status
    res.json({ message: 'Bear updated!' });

  })

  // delete the bear with this id (accessed at DELETE http://localhost:8080/api/bears/:bear_id)
  .delete(function (req, res) {
    let bear_id = req.params.bear_id;
    let bear_found = bear.remove({ '$loki': parseInt(bear_id) });
    res.json({ message: 'Bear deleted' });
  });

// REGISTER OUR ROUTES: all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER ============================================================
app.listen(port);
console.log('Magic happens on port ' + port);