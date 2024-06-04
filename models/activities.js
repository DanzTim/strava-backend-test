const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
	{
		event_time: {
			type: Date,
			set: (d) => new Date(d * 1000),
		},
		object_id: String,
		object_type: String,
		owner_id: String,
		created_at: { type: Date, required: true, default: Date.now },
	},
	{
		collection: 'activity',
	}
);

const Activity = mongoose.model('activity', activitySchema);

module.exports = Activity;
