const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
	{
		event_time: {
			type: Date,
		},
		object_id: String,
		name: String,
		type: String,
		object_type: String,
		owner_id: String,
		created_at: { type: Date, required: true, default: Date.now },
	},
	{
		collection: 'activities',
	}
);

const Activity = mongoose.model('activity', activitySchema);

module.exports = Activity;
