const { Router } = require("express");
const User = require("../models/user");
const Parking = require("../models/Parking");
const Reservation = require("../models/Active_Reservation");
axios = require("axios")
var session = require('express-session');

const router = Router();

router.use(require("express-session")({
  secret: "Rusty is a dog",
  resave: false,
  saveUninitialized: false
}));

// Date
const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.get("/Availibility", async (req, res) => {

  try {
    const search = req.query.search || "";
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) - 1 || 0;

    const park = await Parking.find({ address: { $regex: search, $options: "i" } })

    console.log(park);
    return res.render("Availibility", { parkings: park });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

router.get("/seemore/:id", async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);
    console.log(parking);
    return res.render("seemore", { parking });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.get("/booking/:id", async (req, res) => {


  let currentDate = `${day}-${month}-${year}`;
  console.log(currentDate)

  const parking = await Parking.findById(req.params.id);
  console.log(parking);
  req.session.parking = parking;
  return res.render("booking",
    {
      parking,
      currentDate,
      email: req.session.email
    });

});

router.post("/Reservation", async (req, res) => {
  try {
    const Price = req.session.parking.Reservation_Price;
    const Restaurant = await Reservation.findOne({ restaurant: req.body.restaurant });
    // const parking = await Parking.findById();
    const Arriving = req.body.Entry_time;
    const Leaving = req.body.Exit_time;
    // 
    console.log(Price);

    // Arriving and leaving time
    console.log(Leaving, Arriving);
    var timeNUM = Leaving - Arriving;
    console.log(timeNUM);

    //Total time into 2 string
    const time = timeNUM.toString();
    var time1 = Number(time.slice(0, 1));
    var time2 = Number(time.slice(1, 3));
    var TotalTime = time1 + " hour";
    var TotalPrice = time1 * Price;
    //
    console.log(TotalPrice);


    const Arriving1 = Arriving.slice(0, 2);
    const Arriving2 = Arriving.slice(2, 4);
    var MainArriving = Arriving1 + ":" + Arriving2 + "am";

    const Leaving1 = Leaving.slice(0, 2);
    const Leaving2 = Leaving.slice(2, 4);
    var MainLeaving = Leaving1 + ":" + Leaving2 + "am";
    // 
    console.log(TotalTime);
    //  
    console.log(MainArriving);
    // 
    console.log(MainLeaving);

    res.render("Reservationproc1", {
      TotalTime,
      TotalPrice,
      MainArriving,
      MainLeaving,
      Date: req.body.date,
      Spot: req.body.spot,
      email: req.session.email,
      address: req.body.address
    })


  } catch (error) {
    console.log(error.message);
  }

});

router.post("/Booking", async (req, res) => {
  const reservation = await Reservation.create({
    Price: req.body.Price,
    Time: req.body.Time,
    Arriving: req.body.Arriving,
    Leaving: req.body.Leaving,
    date: req.body.date,
    spot: req.body.spot,
    address: req.body.address,
    Username: req.body.Username,
    Email: req.body.Email,
    user_ID: req.session.userID
  });
  // res.render("ReservationComplete.ejs")
})

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const email2 = req.body.email; // Assuming you retrieve the username from the login form
  const response = await User.findOne({ email: email2 });
  console.log(response._id);
  req.session.userID = response._id;
  req.session.email = email2;

  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);

    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  await User.create({
    fullName,
    email,
    password,
  });
  return res.redirect("/");
});

module.exports = router;
