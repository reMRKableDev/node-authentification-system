require("dotenv").config();

/* Database configuration */
const { connector } = require("./database/models/");

const { sessionCookie, sessionSecret, port } = require("./config");

const isUserLoggedIn = require("./middleware/isUserLoggedIn.middleware");

/* Controllers */
const getHome = require("./api/controllers/homeController");
const getLogout = require("./api/controllers/logoutController");
const {
  getRegistrationPage,
  postUserRegistration,
} = require("./api/controllers/registerController");
const {
  getLoginPage,
  postUserLogin,
} = require("./api/controllers/loginController");

/* NPM packages */
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const morgan = require("morgan");
const flash = require("express-flash");
const { check } = require("express-validator/check");

/* Application conf */
const app = express();

/* Template engine setup */
app.set("view engine", "ejs");

/* Middleware: NPM packages */
app.use(morgan("dev"));
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    name: sessionCookie,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.use("/profile", require("./api/routes/profile.route"));

/* Routes */
app.get("/", isUserLoggedIn, getHome);

app.get("/register", isUserLoggedIn, getRegistrationPage);
app.post(
  "/register",
  [
    check("email")
      .isEmail()
      .withMessage(
        "Please use a proper email format like 'name@mailservice.com'!"
      ),
    check("username")
      .isAlphanumeric()
      .withMessage(
        "Sorry! Your username may only contain letters and/or numbers"
      ),
    check("password")
      .isLength({ min: 5 })
      .withMessage("Your password is too short, choose a longer one!"),
  ],
  postUserRegistration
);

app.get("/login", isUserLoggedIn, getLoginPage);
app.post("/login", postUserLogin);
app.get("/logout", getLogout);

/* Start server & Run db */
connector
  .sync()
  .then(() => {
    app.listen(port, () => console.log(`I've got ears on port: ${port}`));
  })
  .catch((error) =>
    console.error(`Couldn't sync with database: ${error.stack}`)
  );
