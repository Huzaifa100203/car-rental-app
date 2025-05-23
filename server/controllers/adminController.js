const expressAsyncHandler = require("express-async-handler");
const Car = require("../models/carModel");
const Rental = require("../models/rentalModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");
const uploadOnCloudinary = require("../config/cloudinary");

const addCar = expressAsyncHandler(async (req, res) => {
  const {
    name,
    fuelType,
    category,
    rate,
    company,
    registration,
    description,
    mileage,
    seats,
    transmission,
  } = req.body;

  if (
    !name ||
    !fuelType ||
    !category ||
    !rate ||
    !company ||
    !registration ||
    !mileage ||
    !seats ||
    !transmission
  ) {
    res.status(400);
    throw new Error("Please Fill Details!!");
  }

  const carImageLocalPath = req.file?.path

  console.log(carImageLocalPath)

  if (!carImageLocalPath) {
    res.status(400)
    throw new Error("Image file is required");
  }

  const image = await uploadOnCloudinary(carImageLocalPath)
  console.log(image)

  const car = await Car.create({
    name,
    fuelType,
    category,
    rate,
    company,
    registration,
    image: image.url,
    description,
    mileage,
    seats,
    transmission,
  });

  if (!car) {
    res.status(400);
    throw new Error("Car Not Created");
  }

  res.status(201).json(car);
});

// const updateCar = expressAsyncHandler(async (req, res) => {
//   try {
//     const updatedContent = { ...req.body };
//     console.log(req.body, req.file, "req . file from controller")
//     if (req.file?.path) {
//       const imagePath = req.file?.path;
//       console.log("Image Path", imagePath)

//       const updatedImage = await uploadOnCloudinary(imagePath);
//       console.log("Updated Image",updatedImage);

//       if (!updatedImage.url) {
//         throw new Error("Failed to upload image to Cloudinary");
//       }

//       updatedContent.image = updatedImage.url ;
//     }

//     const updatedCar = await Car.findByIdAndUpdate(req.params.id, updatedContent, {
//       new: true, 
//     });

//     if (!updatedCar) {
//       res.status(400);
//       throw new Error("Car can't be updated");
//     }

//     res.status(200).json(updatedCar);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// });

const updateCar = expressAsyncHandler(async (req, res) => {
  try {
    const updatedContent = {};

    // Add only defined fields from req.body to updatedContent
    for (const [key, value] of Object.entries(req.body)) {
      if (value !== undefined && value !== "undefined") {
        updatedContent[key] = value;
      }
    }

    console.log("Filtered body:", updatedContent);

    // Handle image upload if a file is provided
    if (req.file?.path) {
      const imagePath = req.file.path;
      console.log("Image Path:", imagePath);

      const updatedImage = await uploadOnCloudinary(imagePath);
      console.log("Updated Image:", updatedImage);

      if (!updatedImage.url) {
        throw new Error("Failed to upload image to Cloudinary");
      }

      updatedContent.image = updatedImage.url;
    }

    // Update car with filtered data
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, updatedContent, {
      new: true,
    });

    if (!updatedCar) {
      res.status(400);
      throw new Error("Car can't be updated");
    }

    res.status(200).json(updatedCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


const removeCar = expressAsyncHandler(async (req, res) => {
  await Car.findByIdAndDelete(req.params.id);
  res.status(200).json({
    id: req.params.id,
    message: "Car Removed",
  });
});

const getAllRentals = expressAsyncHandler(async (req, res) => {
  // Get all rentals with populated car and user fields
  const rentals = await Rental.find()
    .populate("car")
    .populate("user", "-password -isAdmin");

  if (!rentals || rentals.length === 0) {
    res.status(404);
    throw new Error("No Rentals Found");
  }

  // Get all users
  const users = await User.find({}, "-password -isAdmin");

  if (!users || users.length === 0) {
    res.status(404);
    throw new Error("No Users Found");
  }

  // Create a mapping of users to their rentals
  const usersWithRentals = users.map(user => {
    if (!user || !user._id) {
      return null;
    }

    // Filter rentals for the current user
    const userRentals = rentals.filter(rental =>
      rental.user && rental.user._id &&
      rental.user._id.toString() === user._id.toString()
    );

    // Return user object with their rentals
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      license: user.license,
      createdAt: user.createdAt,
      rentals: userRentals.map(rental => {
        if (!rental.car) {
          return "null";
        }

        return {
          _id: rental._id,
          car: rental.car,
          pickupDate: rental.pickupDate,
          dropDate: rental.dropDate,
          totalBill: rental.totalBill,
          status: rental.car.isBooked ? "Booked" : "Available",
          createdAt: rental.createdAt
        };
      }).filter(Boolean) // Remove null entries
    };
  }).filter(Boolean); // Remove null entries

  res.status(200).json({
    users: usersWithRentals,
    totalUsers: usersWithRentals.length,
    totalRentals: rentals.length
  });
});

const getAllUserReviews = expressAsyncHandler(async (req, res) => {
  const reviews = await Review.find();
  const users = await User.find();

  const userWithReviews = await Promise.all(
    users.map(async (user) => {
      if (!user || !user._id) {
        return null;
      }

      // Filter reviews for the current user
      const userReviews = reviews.filter(
        (review) =>
          review.user &&
          review.user._id &&
          review.user._id.toString() === user._id.toString()
      );

      // Map over user reviews and fetch car details
      const reviewsWithCarNames = await Promise.all(
        userReviews.map(async (review) => {
          if (!review.car) {
            return null;
          }

          const car = await Car.findById(review.car).select("name");
          return {
            _id: review._id,
            car: review.car,
            carName: car ? car.name : "Unknown Car",
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
          };
        })
      );

      // Return user details along with their reviews
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        reviews: reviewsWithCarNames.filter(Boolean), // Remove null entries
      };
    })
  );

  // Filter out users with no reviews
  const filteredUsers = userWithReviews.filter(
    (user) => user && user.reviews && user.reviews.length > 0
  );

  res.status(200).json({
    userWithReviews: filteredUsers, // Only users with reviews
    totalReviews: reviews.length,
  });
});

module.exports = {
  addCar,
  updateCar,
  removeCar,
  getAllRentals,
  getAllUserReviews,
};
