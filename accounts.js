const router = require('express').Router();
const Account = require('./models/accounts');

//List all accounts
router.get('/get-all', async (req, res, next) => {
	let accounts = await Account.find().catch((err) => {
		console.error(err);
	});
	res.json(accounts);
});

//List account by id
router.get('/:id', async (req, res, next) => {
	let accounts = await Account.findOne({ _id: req.params.id }).catch((err) => {
		console.error(err);
	});
	res.json(accounts);
});

module.exports = router;
