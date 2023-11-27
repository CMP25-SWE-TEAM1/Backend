const express = require('express');
const cookieSession = require("cookie-session");

const morgan = require('morgan');
const cors = require('cors');
require('./db/mongoose');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const tweetRouter = require('./routes/tweetRoutes');
const HomepageRouter = require('./routes/homepage_router');
const HashtagRouter = require('./routes/hashtag_router');
const app = express();

const passportSetup = require("./google-passport");
const passport = require("passport");
const authRoute = require("./routes/google_router");

// MIDDLEWARES

app.use(
    cors({
        origin: "http://localhost:3001",
        methods: "GET,POST,PUT,DELETE",
        credentials: true,
    })
);


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
// app.use(express.static(`${__dirname}/public`));// for static data in public
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Handling  Wrong Route Req.
//Routs

//region authgoogle

app.use(
    cookieSession({ name: "session", keys: ["google-auth"], maxAge: 24 * 60 * 60 * 100 })
);

app.use(passport.initialize());
app.use(passport.session());


app.use("/auth", authRoute);


//endregion

app.use('/api/user', userRouter);
app.use('/api/homepage', HomepageRouter);
app.use('/api/trends', HashtagRouter);
app.use('/api/tweets', tweetRouter);

// Handling  Wrong Route Req.
app.all('*', (req, res, next) => {
  //create ourError obj and send it
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler); // the final middleWare for express

module.exports = app;
