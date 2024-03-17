const { Router } = require("express");
const User = require("../models/user");
const Parking = require("../models/Parking");
axios = require("axios")


const router = Router();

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

    // const response = { park, };
    return res.render("Availibility", { parkings: park });
    // res.status(200).json(response);
} catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
}
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
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
