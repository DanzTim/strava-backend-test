const router = require('express').Router();
const Activity = require('./models/activities')

//List all activities 
router.get('/get-all', async (req, res, next) => {
  let activities = await Activity.find().catch((err) => {
    console.error(err);
  });
  if(req.query.type){
    activities = await Activity.find({ object_type: req.query.type }).catch((err) => {
			console.error(err);
		});
  }
  if (req.query.user_id) {
		activities = await Activity.find({ owner_id: req.query.user_id }).catch(
			(err) => {
				console.error(err);
			}
		);
	}
  if (req.query.user_id && req.query.type) {
		activities = await Activity.find({ owner_id: req.query.user_id, object_type: req.query.type }).catch(
			(err) => {
				console.error(err);
			}
		);
	}
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

router.delete('/:id', async (req, res, next) => {
  await Activity.deleteOne({ object_id: req.params.id }).catch(
		(err) => {
			console.error(err);
		}
	);
	res.send("Successfully deleted activity");
});

module.exports = router;