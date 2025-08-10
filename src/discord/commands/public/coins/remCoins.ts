import { createCommand } from "#base";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from "discord.js";
import { QuickDB } from "quick.db";

createCommand({
	name: "remcoins",
	description: "Remover moedas de um usuário.",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "user",
			description: "O usuário que terá as moedas removidas",
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: "amount",
			description: "A quantidade de moedas a remover",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			minValue: 1,
		},
	],

	async run(interaction) {
		if (interaction.memberPermissions.has("Administrator")) {
			interaction.reply({
				flags: ["Ephemeral"],
				content: "❌ Você não tem permissão para executar este comando.",
			});
			return;
		}

		const user = interaction.options.getUser("user", true);
		const amount = interaction.options.getInteger("amount", true);
		const db = new QuickDB();

		const currentBalance = (await db.get(`coins.${user.id}`)) ?? 0;

		if (currentBalance < amount) {
			interaction.reply({
				flags: ["Ephemeral"],
				content: `❌ ${user} não tem moedas suficientes. Saldo atual: ${currentBalance} moedas.`,
			});
			return;
		}

		await db.sub(`coins.${user.id}`, amount);
		const newBalance = (await db.get(`coins.${user.id}`)) ?? 0;

		await interaction.reply({
			flags: ["Ephemeral"],
			content: `Removido ${amount} moedas de ${user}. Novo saldo: ${newBalance} moedas.`,
		});
	},
});
