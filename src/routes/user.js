const express = require("express");
// const router = express.Router();
const User = require("../models/user");
const Parking = require("../models/Parking");
const Reservation = require("../models/Active_Reservation");
axios = require("axios")
var session = require('express-session');

const router = express.Router();
const fs = require('fs');
const ejs = require('ejs');
const { createVerify } = require("crypto");
const multer = require("multer");
const nodemailer = require('nodemailer');
const Active_Reservation = require("../models/Active_Reservation");

router.use(require("express-session")({
  secret: "Rusty is a dog",
  resave: false,
  saveUninitialized: false
}));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


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

router.get("/explore", async (req, res) => {
  // console.log(req.user);

  res.render("explore", {
    user: req.user
  });
})

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
    // const limit = parseInt(req.query.limit) || 5;
    // const page = parseInt(req.query.page) - 1 || 0;

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
  const reservation = await Reservation.find({ address: parking.address })


  const activeSpot = []

  reservation.forEach(element => {
    if (element.isActive === true) {
      activeSpot.push(element.spot)
      // console.log("Active Spot:-", activeSpot);
    }
  })




  const userData = req.user;
  const email = userData.email
  return res.render("booking",
    {
      parking,
      currentDate,
      email: email,
      activeSpot
    });




});

router.post("/Reservation", async (req, res) => {
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

    const userData = req.user;
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


router.get("/invoice/:id", async (req, res) => {

  const template = fs.readFileSync('./views/Invoice.ejs', 'utf-8');

  // Compile the template
  const compiledTemplate = ejs.compile(template);

  // Example data (replace with your actual data)
  const reservation = await Reservation.findById(req.params.id)
  // Generate the HTML string
  const invoiceHtml = compiledTemplate(reservation);


  pdf.create(invoiceHtml, { phantomPath: phantomjs.path }).toStream((err, stream) => {
    if (err) {
      return res.status(500).send('Error generating PDF');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
    stream.pipe(res);
  });
});



// router.get("/invoice/:id", async (req, res) => {
//   try {
//     const fileId = req.params.id;
//     const reservation = await Reservation.findById(fileId);
//     console.log("reservation", reservation);

//     if (!reservation) {
//       return res.status(404).send("File not found");
//     }

//     // Assuming your schema has a 'pdfData' field (Buffer)
//     if (!reservation.pdfData) {
//       return res.status(400).send("No PDF data found for this reservation");
//     }

//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': `attachment; filename="${reservation.Username || "invoice"}.pdf"`
//     });

//     return res.send(reservation.pdfData);

//   } catch (error) {
//     console.error("Error downloading file:", error);
//     res.status(500).send("Error downloading file");
//   }
// });


router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const email2 = req.body.email; // Assuming you retrieve the username from the login form



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
  const userData = req.user;
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


// Profile FullName edit
router.put("/update-name/:id", async (req, res) => {
  try {

    const userId = req.params.id
    const { fullName } = req.body;
    console.log(userId, req.body);


    if (!userId || !fullName) {
      return res.status(400).json({ message: "userId and fullName are required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { fullName },
      { new: true } // return updated user
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Full name updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// Store file in memory as buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Profile Image edit
router.put("/profile-image/:id", upload.single("profileImage"), async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId || !req.file) {
      return res.status(400).json({ message: "userId and profile image are required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        profileImageData: req.file.buffer,
        profileImageType: req.file.mimetype,
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile image updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// Contact us form

router.post("/contact", async (req, res) => {
  const { subject, email, message } = req.body;
  console.log(req.body);

  if (!subject || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }


  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `Contact Form: ${subject}`,
      text: `From: ${email}\n\n${message}`,
    };

    // Send mail
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: "Email failed to send" });
  }
});

module.exports = router;
