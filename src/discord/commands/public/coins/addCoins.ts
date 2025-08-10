import { createCommand } from "#base";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from "discord.js";
import { QuickDB } from "quick.db";

createCommand({
	name: "addcoins",
	description: "Adicionar moedas a um usuário.",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "user",
			description: "O usuário que receberá as moedas",
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: "amount",
			description: "A quantidade de moedas a adicionar",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			minValue: 1,
		},
	],

	async run(interaction) {
		const user = interaction.options.getUser("user", true);
		const amount = interaction.options.getInteger("amount", true);

		const db = new QuickDB();
		await db.add(`coins.${user.id}`, amount);

		const newBalance = (await db.get(`coins.${user.id}`)) ?? 0;

		await interaction.reply({
			flags: ["Ephemeral"],
			content: `Adicionado ${amount} moedas para ${user}. Novo saldo: ${newBalance} moedas.`,
		});
	},
});
