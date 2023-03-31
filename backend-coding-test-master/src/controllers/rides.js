const db = require('../db');

exports.getRides = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const query = 'SELECT * FROM Rides LIMIT ? OFFSET ?'
    const rides = await db.all(query, limit, offset);
    res.send(rides);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getRideById = async (req, res) => {
  try {
    const query = 'SELECT * FROM Rides WHERE rideID = ?'
    const ride = await db.get(query, req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    res.send(ride);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};



function validateRideRequest(req) {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;
  
    if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
      return {
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
      };
    }
  
    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      return {
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
      };
    }
  
    if (typeof riderName !== 'string' || riderName.length < 1) {
      return {
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string'
      };
    }
  
    if (typeof driverName !== 'string' || driverName.length < 1) {
      return {
        error_code: 'VALIDATION_ERROR',
        message: 'Driver name must be a non empty string'
      };
    }
  
    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      return {
        error_code: 'VALIDATION_ERROR',
        message: 'Driver vehicle must be a non empty string'
      };
    }
  
    return null; // Return null if there are no validation errors
  }
  
  // Function to insert a new ride into the database
  async function insertRideIntoDB(req) {
    const values = [
      req.body.start_lat,
      req.body.start_long,
      req.body.end_lat,
      req.body.end_long,
      req.body.rider_name,
      req.body.driver_name,
      req.body.driver_vehicle
    ];
  
    const query= 'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)'
    const result = await db.run(query, values);
  
    if (!result) {
      return {
        error_code: 'SERVER_ERROR',
        message: 'Unknown error'
      };
    }
  
    const query1 = 'SELECT * FROM Rides WHERE rideID = ?'
    const ride = await db.get(query1, result.lastID);
  
    if (!ride) {
      return {
        error_code: 'SERVER_ERROR',
        message: 'Unknown error'
      };
    }
  
    return ride;
  }
  
  // Handler function for POST /rides endpoint
  exports.createRide = async (req, res) => {
    const validationError = validateRideRequest(req);
    if (validationError) {
      return res.send(validationError);
    }
  
    const ride = await insertRideIntoDB(req);
    if (ride.error_code) {
      return res.send(ride);
    }
  
    res.send(ride);
  }