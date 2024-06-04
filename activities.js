const router = require('express').Router();
const Activity = require('./models/activities')

//List all activities 
router.get('/get-all', async (req, res, next) => {
  let activities = Activity.find({});
  if(req.query.type){
    activities = Activity.find({ object_type: req.query.type })
  }
  if (req.query.user_id) {
		activities = Activity.find({ owner_id: req.query.user_id })
	}
  if (req.query.user_id && req.query.type) {
		activities = Activity.find({ owner_id: req.query.user_id, object_type: req.query.type })
	}
  activities = await activities
		.sort({ event_time: 'desc' })
		.exec()
		.catch((err) => {
			console.error(err);
		});
	res.json(activities);
});

//List activity by id
router.get('/:id', async (req, res, next) => {
	let accounts = await Activity.findOne({ object_id: req.params.id }).catch(
		(err) => {
			console.error(err);
		}
	);
	res.json(accounts);
});

// Delete activity by id
router.delete('/:id', async (req, res, next) => {
  await Activity.deleteOne({ object_id: req.params.id }).catch(
		(err) => {
			console.error(err);
		}
	);
	res.send("Successfully deleted activity");
});

module.exports = router;