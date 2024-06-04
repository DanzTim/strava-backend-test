const router = require('express').Router();
const Activity = require('./models/activities');

router.post('/', async (req, res) => {
	console.log('webhook event received!', req.query, req.body);
	let { object_id, event_time, object_type, owner_id } = req.query;
	await Activity.create({
		event_time: event_time,
		object_id: object_id,
		object_type: object_type,
		owner_id: owner_id
	}).catch(err => console.error(err));
	res.status(200).send('EVENT_RECEIVED');
});

router.get('/', (req, res) => {
	console.log('webhook initialized!', req.query);
	const VERIFY_TOKEN = 'TESTCODINGCHALLANGE';
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];
	if (mode && token) {
		if (mode === 'subscribe' && token === VERIFY_TOKEN) {
			res.json({ 'hub.challenge': challenge });
		} else {
			return res.sendStatus(403);
		}
	} else {
		res.sendStatus(403);
	}
});

module.exports = router;