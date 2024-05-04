require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookiePaser = require("cookie-parser");

// const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const adminRoute = require("./routes/admin");

const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

mongoose.set('strictQuery', true);
mongoose
  .connect("mongodb+srv://admin:1234@api.w1sen0x.mongodb.net/?retryWrites=true&w=majority")
  .then((e) => console.log("MongoDB Connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(cookiePaser());
app.use(checkForAuthenticationCookie("token"));
// app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  res.render("home", {
    user: req.user
  });
});

app.use("/user", userRoute);
app.use("/admin", adminRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));