require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const activities = require('./activities');
const webhook = require('./webhook');
const accounts = require('./accounts');
const Account = require('./models/accounts');
const path = require('path');
const StravaStrategy = require('passport-strava-oauth2').Strategy;

const app = express();
const PORT = 3000;

const mongoUser = process.env.DB_USERNAME;
const mongoPassword = process.env.DB_PASSWORD;
const mongoCluster = process.env.DB_CLUSTER;
const uri = `mongodb+srv://${mongoUser}:${mongoPassword}@${mongoCluster}.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster`;

mongoose.connect(uri);


app.use('/favicon.ico', express.static('images/favicon.ico'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/favicon.ico', (req, res) => {
	return res.sendFile(path.join(__dirname + '/images/favicon.ico'));
});
app.get('/', (req, res) => {
	res.render('login');
});

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

app.post('/disconnect', (req, res, next) => {
	if (req.session) {
		req.session.destroy();
	}
	res.clearCookie('connect.sid');
	if (req.user) {
		Account.deleteOne({ _id: req.user.id }).catch((err) => {
			console.log(err);
			next(err);
		});
		req.logout(function (err) {
			if (err) {
				return next(err);
			}
		});
	}
	res.render('logout');
});

app.use('/accounts', accounts);
app.use('/activities', activities);
app.use('/webhook', webhook);

app.get('/login', (req, res, next) => {
	res.render('failed-login');
});

app.get('/home', (req, res, next) => {
	if(!req.user){
		res.render('logout')
	}else{
		res.render('home', {
			user: req.user
		});
	}
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

module.exports = app;