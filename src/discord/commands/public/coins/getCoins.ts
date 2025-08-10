import { createCommand } from "#base";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from "discord.js";
import { QuickDB } from "quick.db";

createCommand({
	name: "coins",
	description: "Ver moedas de um usuário.",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "user",
			description: "O usuário que deseja ver as moedas",
			type: ApplicationCommandOptionType.User,
			required: false,
		},
	],

	async run(interaction) {
		const user = interaction.options.getUser("user") || interaction.user;

		const db = new QuickDB();
		const coins = (await db.get(`coins.${user.id}`)) || 0;

		await interaction.reply({
			flags: ["Ephemeral"],
			content: `O usuário ${user} tem ${coins} coins.`,
		});
	},
});
