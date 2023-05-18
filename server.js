require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const fs = require("fs");
var session = require("express-session");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
});

const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// use helmet and limiter
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       "script-src": ["'self'", "js.xendit.co"],
//     },
//   },
//   crossOriginResourcePolicy: false,
// }));
// app.use(limiter);

// use bootstrap
app.use(
  "/bootstrap",
  express.static(__dirname + "/node_modules/bootstrap/dist")
);

app.set("views", path.join(__dirname, "app/views"));
app.set("view engine", "pug");

/*setup session */
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    name: "auth",
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.SECURE_SESSION, // This will only work if you have https enabled!
      maxAge: parseInt(process.env.SESSION_MAX_AGE), // 1 day
    },
  })
);
/*end setup session */

var routePath="./app/routes/api/v1/"; 
fs.readdirSync(routePath).forEach(function(file) {
    var route=routePath+file;
    require(route)(app);
});
var routePath="./app/routes/web/"; 
fs.readdirSync(routePath).forEach(function(file) {
    var route=routePath+file;
    require(route)(app);
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
