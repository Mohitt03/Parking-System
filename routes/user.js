const { Router } = require("express");
const User = require("../models/user");
const Parking = require("../models/Parking");
const Reservation = require("../models/Reservation");
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
  return res.render("booking",
    {
      parking,
      currentDate,
      email: req.session.email
    });

});

router.post("/Reservation", async (req, res) => {
  try {
    const Restaurant = await Reservation.findOne({ restaurant: req.body.restaurant });
    const Date = await Reservation.findOne({ date: req.body.date });
    const Time = await Reservation.findOne({ time: req.body.time });
    if (Restaurant && Date && Time) {

      return res.render("booking", { avialaibility: "none" })

    }
    else {
      const reservation = await Reservation.create({
        Username: req.body.Username,
        date: req.body.date,
        Entry_time: req.body.Entry_time,
        Exit_time: req.body.Exit_time,
        spot: req.body.spot,
        address: req.body.address
      });
      res.render("ReservationComplete.ejs")

    }
  } catch (error) {
    console.log(error.message);
  }

});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const email2 = req.body.email; // Assuming you retrieve the username from the login form
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
