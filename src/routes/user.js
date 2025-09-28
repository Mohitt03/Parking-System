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
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser')

router.use(cookieParser());

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



function authMiddleware(req, res, next) {
  const token = req.cookies.token; // 👈 express will parse cookies if you use cookie-parser
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded; // now available in other routes
    next();
  });
}


router.get("/Availibility", async (req, res) => {

  try {
    const search = req.query.search || "";
    // const limit = parseInt(req.query.limit) || 5;
    // const page = parseInt(req.query.page) - 1 || 0;

    const park = await Parking.find({ address: { $regex: search, $options: "i" } })

    return res.render("Availibility", { parkings: park });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

router.get("/seemore/:id", async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);
    return res.render("seemore", { parking });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "error" });
  }
});


router.get('/Spot/:id', async (req, res) => {
  try {
    const data = await Reservation.findById(req.params.id, { spot: 1 })
    res.json(data)
  } catch (error) {
    console.log(error);
  }
})

router.get("/booking/:id", requireLogin, async (req, res) => {

  try {
    let currentDate = `${day}-${month}-${year}`;

    const parking = await Parking.findById(req.params.id)
    const data = await Reservation.findById(parking.id, { spot: 1, _id: 0 })
    console.log(parking.id, data);

    let token = req.cookies.token;
    const user = jwt.verify(token, process.env.JWT_SECRET);

    return res.render("booking",
      {
        parking,
        id: parking._id,
        currentDate,
        email: user.email,
        data
      });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: true, message: "Internal Server Error" });

  }
});

router.post("/Reservation/:id", async (req, res) => {
  try {
    const Price = req.session.parking.Reservation_Price;
    const Restaurant = await Reservation.findOne({ restaurant: req.body.restaurant });
    // const parking = await Parking.findById();
    req.session.mapLink = req.body.link;

    const startTime = req.body.Entry_time + ":00";
    const endTime = req.body.Exit_time + ":00";
    const startDate = req.body.date + "T";

    const STT = startDate + startTime;
    const ETT = startDate + endTime;

    // Time, Price, Discount Calculator
    function getTimeDifference(STT, ETT, Price) {
      // Convert dates to milliseconds since epoch
      const startMillis = new Date(STT).getTime();
      const endMillis = new Date(ETT).getTime();

      // Calculate the difference in milliseconds
      const diffInMilliseconds = Math.abs(endMillis - startMillis);


      // Convert milliseconds to days, hours, minutes, and seconds
      const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffInMilliseconds % (1000 * 60)) / 1000);
      // Format the output string
      TT = "";
      if (days > 0) {
        TT += `${days} day${days > 1 ? "s" : ""} `;
      }
      if (hours > 0) {
        TT += `${hours} hour${hours > 1 ? "s" : ""} `;
      }
      if (minutes > 0) {
        TT += `${minutes} minute${minutes > 1 ? "s" : ""} `;
      }
      if (minutes) {
        console.log("Discount");

      }
      TP = Price * hours;
    }
    // END
    getTimeDifference(STT, ETT, Price)
    console.log(
      TT,
      TP,
      "Arriving =" + startTime,
      "Leaving =" + endTime,
      startDate,
      STT,
      ETT
    );

    // console.log(STT, ETT);

    const userData = localStorage.getItem("email");
    ;
    const email = userData.email
    res.render("Reservationproc1", {
      TotalTime: TT,
      TotalPrice: TP,
      MainArriving: req.body.Entry_time,
      MainLeaving: req.body.Exit_time,
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
  const mapLink = req.session.mapLink;
  res.render("ReservationComplete.ejs", {
    reservation, mapLink

  })

})


// router.get("/invoice/:id", async (req, res) => {

//   const template = fs.readFileSync('./views/Invoice.ejs', 'utf-8');

//   // Compile the template
//   const compiledTemplate = ejs.compile(template);

//   // Example data (replace with your actual data)
//   const reservation = await Reservation.findById(req.params.id)
//   // Generate the HTML string
//   const invoiceHtml = compiledTemplate(reservation);

//   // Generate PDF from HTML
//   pdf.create(invoiceHtml).toStream((err, stream) => {
//     if (err) {
//       res.status(500).send('Error generating PDF');
//     } else {
//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
//       stream.pipe(res);
//     }
//   });
// });



// router.get("/invoice/:id", async (req, res) => {
//   try {

//     const fildId = req.params.id;
//     const file = await Reservation.findById(fildId)
//     if (!file) {
//       return res.status(404).send("File Not Found")
//     }

//     // Headers for downloading
//     res.set({
//       'content-Type': 'application/pdf',
//       'content-Disposition' : `attachment; filename${file.Username}`
//     })

//     return res.send(file.)

//   } catch (error) {
//     res.status(500).send("Error downloading file")
//   }
// });

// router.post("/signin", async (req, res) => {
//   const { email, password } = req.body;
//   const email2 = req.body.email; // Assuming you retrieve the username from the login form
//   // const response = await User.findOne({ email: email2 });
//   // console.log(response, req.body);

//   // const userData = { email: response.email };

//   // Save an email in localStorage
//   // localStorage.setItem(user);  

//   try {
//     const token = await User.matchPasswordAndGenerateToken(email, password);

//     // Redirect to the original page
//     const returnTo = req.session.returnTo || '/';
//     delete req.session.returnTo; // Clear the saved URL
//     return res.cookie("token", token).redirect(returnTo);
//   } catch (error) {
//     return res.render("signin", {
//       error: "Incorrect Email or Password",
//     });
//   }
// });



router.post('/signin', async (req, res) => {
  const { email, username, phoneNumber, password } = req.body;

  try {
    // Find user by email, username, or phone number
    const user = await User.findOne({
      $or: [{ email }, { username }, { phoneNumber }]
    });
    console.log(phoneNumber, user);

    if (!user) return res.status(400).json({ message: 'User not found' });

    // Compare password 
    // matchPasswordAndGenerateToken IS  MONGODB STATIC METHOD Check this method in user model
    const token = await User.matchPasswordAndGenerateToken(email, password);

    if (!token) return res.status(400).json({ message: 'Invalid credentials' });
    console.log(token);


    // Set token in cookies
    res.cookie('token', token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: "lax"
    });
    // Redirect to the original page
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo; // Clear the saved URL
    return res.cookie("token", token).redirect(returnTo);
  } catch (err) {

    console.error(err);

    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
    // console.error(err);
    // res.status(500).json({ message: 'Server error' });
  }
});




// History of reservations
router.get("/reservations", async (req, res) => {
  const userData = localStorage.getItem("email");
  ;
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
