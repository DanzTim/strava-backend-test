const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  _id: String,
	full_name: String,
	token: String,
	refresh_token: String,
	city: String,
	country: String,
	sex: String,
	created_at: { type: Date, required: true, default: Date.now },
}, {
  collection: 'accounts'
});

const Account = mongoose.model('accounts', accountSchema);

module.exports = Account;