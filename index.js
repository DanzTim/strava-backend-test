require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const actRoutes = require('./activities');
const StravaStrategy = require('passport-strava-oauth2').Strategy;

const app = express();
const PORT = 3000;

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
	db.models.user
		.findById(id)
		.then((user) => done(null, user))
		.catch(done)
);

const mongoUser = process.env.DB_USERNAME;
const mongoPassword = process.env.DB_PASSWORD;
const mongoCluster = process.env.DB_CLUSTER;
const uri = `mongodb+srv://${mongoUser}:${mongoPassword}@${mongoCluster}.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster`;

mongoose.connect(uri);
const db = mongoose.connection;

app.use(
	session({
		secret: process.env.SESSION_SECRET || 'secret123',
		store: new MongoStore({ mongoUrl: db.client.s.url }),
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());

const stravaConfig = {
	clientID: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	callbackURL: 'http://localhost:3000/callback',
};
const strategy = new StravaStrategy(
	stravaConfig,
	(accessToken, refreshToken, profile, done) => {
		console.log('strava strategy', profile);
		console.log('token', accessToken);
		console.log('refresh token', refreshToken);
		// const stravaId = profile.id;
		// const name = profile.displayName;
		// const email = profile.emails[0].value;
	// 	User.find({ where: { stravaId } })
	// 		.then((foundUser) =>
	// 			foundUser
	// 				? done(null, foundUser)
	// 				: User.create({ name, email, stravaId }).then((createdUser) =>
	// 						done(null, createdUser)
	// 				  )
	// 		)
	// 		.catch(done);
	}
);

passport.use(strategy);
app.get(
	'/connect',
	passport.authenticate('strava', { scope: ['activity:read_all'] })
);

app.use('/activities', actRoutes);

app.get('/login', (req, res, next) => {
	console.log(req.session);
	res.send('Login Attempt Failed.');
});

app.get('/home', (req, res, next) => {
	console.log(req.session);
	res.send('Login Attempt was successful.');
});

app.get('/callback',
	passport.authenticate('strava', { failureRedirect: '/login', failWithError: true, failureFlash: true, failureMessage: true, authInfo: true}),
	function (req, res) {
		res.redirect('/home');
	}
);

app.listen(PORT, (error) => {
	if (!error)
		console.log(
			'Server is running on port ' + PORT
		);
	else console.log("Error occurred, server can't start", error);
});