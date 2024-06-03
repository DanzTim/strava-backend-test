require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const actRoutes = require('./activities');
const Account = require('./models/accounts');
const StravaStrategy = require('passport-strava-oauth2').Strategy;

const app = express();
const PORT = 3000;

const mongoUser = process.env.DB_USERNAME;
const mongoPassword = process.env.DB_PASSWORD;
const mongoCluster = process.env.DB_CLUSTER;
const uri = `mongodb+srv://${mongoUser}:${mongoPassword}@${mongoCluster}.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster`;

mongoose.connect(uri);

app.use(
	session({
		secret: process.env.SESSION_SECRET || 'secret123',
		store: new MongoStore({ mongoUrl: uri }),
		resave: false,
		saveUninitialized: false,
	})
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});
passport.deserializeUser((id, done) => {
	Account.findById(id)
		.then((user) => done(null, user))
		.catch(done);
});
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
		const id = profile.id;
		const name = profile.displayName;
		Account.find({ _id: id })
			.then((foundUser) => {
				if (foundUser.length) {
					done(null, foundUser[0]);
				} else {
					Account.create({
						_id: id,
						full_name: name,
						token: accessToken,
						refresh_token: refreshToken,
					}).then((createdUser) => done(null, createdUser));
				}
			})
			.catch((error) => {
				console.error(error);
				done(error);
			});
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

app.get(
	'/callback',
	passport.authenticate('strava', {
		failureRedirect: '/login',
		failWithError: true,
		failureFlash: true,
		failureMessage: true,
		authInfo: true,
	}),
	function (req, res) {
		res.redirect('/home');
	}
);

app.listen(PORT, (error) => {
	if (!error) console.log('Server running on port ' + PORT);
	else console.log("Error occurred, server can't start", error);
});