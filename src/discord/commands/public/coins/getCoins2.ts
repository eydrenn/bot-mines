import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";
import { QuickDB } from "quick.db";

createCommand({
	name: "Ver Coins do Autor",
	type: ApplicationCommandType.Message,
	async run(interaction) {
		try {
			const message = await interaction.channel?.messages.fetch(
				interaction.targetId,
			);
			if (!message) throw new Error("Mensagem não encontrada");

			const db = new QuickDB();
			const coins = (await db.get(`coins.${message.author.id}`)) || 0;

			await interaction.reply({
				ephemeral: true,
				content: `O autor da mensagem ${message.author} tem ${coins} coins.`,
			});
		} catch {
			await interaction.reply({
				ephemeral: true,
				content: "Não foi possível obter as coins.",
			});
		}
	},
});
