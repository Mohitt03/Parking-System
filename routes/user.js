const { Router } = require("express");
const User = require("../models/user");
const Parking = require("../models/Parking");
const Reservation = require("../models/Active_Reservation");
axios = require("axios")
var session = require('express-session');
const pdf = require('html-pdf');
const router = Router();
const fs = require('fs');
const ejs = require('ejs');
const { createVerify } = require("crypto");

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

// Middleware to check if the user is authenticated
function requireLogin(req, res, next) {
  if (!req.user) {
    // Save the current URL to redirect after login
    req.session.returnTo = req.originalUrl;
    res.render("signin", { message: "Please log in or signup!" });
  } else {
    next();
  }
}

router.get("/Availibility", async (req, res) => {

  try {
    const search = req.query.search || "";
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) - 1 || 0;

    const park = await Parking.find({ address: { $regex: search, $options: "i" } })

    return res.render("Availibility", { parkings: park });
  } catch (err) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

router.get("/seemore/:id", async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);
    return res.render("seemore", { parking });
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
});

router.get("/booking/:id", requireLogin, async (req, res) => {

  let currentDate = `${day}-${month}-${year}`;

  const parking = await Parking.findById(req.params.id);
  req.session.parking = parking;



  const userData = req.session.userData;
  const email = userData.email
  return res.render("booking",
    {
      parking,
      currentDate,
      email: email
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

    // Arriving and leaving time
    var timeNUM = Leaving - Arriving;

    //Total time into 2 string
    const time = timeNUM.toString();
    var time1 = Number(time.slice(0, 1));
    var time2 = Number(time.slice(1, 3));
    var TotalTime = time1 + " hour";
    var TotalPrice = time1 * Price;
    //


    const Arriving1 = Arriving.slice(0, 2);
    const Arriving2 = Arriving.slice(2, 4);
    var MainArriving = Arriving1 + ":" + Arriving2 + "am";

    const Leaving1 = Leaving.slice(0, 2);
    const Leaving2 = Leaving.slice(2, 4);
    var MainLeaving = Leaving1 + ":" + Leaving2 + "am";
    // 
    //  
    // 
    const userData = req.session.userData;
    const email = userData.email
    res.render("Reservationproc1", {
      TotalTime,
      TotalPrice,
      MainArriving,
      MainLeaving,
      Date: req.body.date,
      Spot: req.body.spot,
      email: email,
      address: req.body.address
    })


  } catch (error) {
  }

});


router.post("/Booking", async (req, res) => {
  const Payment = req.body.Payment_Method
  if (Payment === "COD") {
    var status = "pending"
  } if (Payment === "Card") {
    var status = "success"
  } else {
    var status = "success"

  }

  console.log(Payment);

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
    user_ID: req.session.userID,
    Payment: {
      status: status,
      Payment_Method: req.body.Payment_Method,

      Card: {
        card_number: req.body.card_number,
        card_expiry: req.body.card_expiry,
        cvc: req.body.cvc,
        card_name: req.body.card_name
      }
      ,
      upi_payment: {
        upi_id: req.body.upi_id
      }
    }
  });
  res.render("ReservationComplete.ejs", { reservation })

})

router.get("/invoice/:id", async (req, res) => {

  const template = fs.readFileSync('./views/Invoice.ejs', 'utf-8');

  // Compile the template
  const compiledTemplate = ejs.compile(template);

  // Example data (replace with your actual data)
  const reservation = await Reservation.findById(req.params.id)
  // Generate the HTML string
  const invoiceHtml = compiledTemplate(reservation);

  // Generate PDF from HTML
  pdf.create(invoiceHtml).toStream((err, stream) => {
    if (err) {
      res.status(500).send('Error generating PDF');
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
      stream.pipe(res);
    }
  });
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const email2 = req.body.email; // Assuming you retrieve the username from the login form
  const response = await User.findOne({ email: email2 });
  const userData = { username: response.fullName, email: response.email };
  // Store user data in the session
  req.session.userData = userData;

  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);

    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo; // Clear the saved URL
    return res.cookie("token", token).redirect(returnTo);
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});


// History of reservations
router.get("/reservations", async (req, res) => {
  const userData = req.session.userData;
  const history = await Reservation.find({ Email: userData.email })
  return res.render("history", { datas: history });

})

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
