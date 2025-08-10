import { createEvent } from "#base";

createEvent({
	name: "Error handler",
	event: "error",
	async run() {
		// logger.error(err);
	},
});
