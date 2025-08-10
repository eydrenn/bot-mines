import { createCommand } from "#base";
import { createRow } from "@magicyan/discord";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import { QuickDB } from "quick.db";

createCommand({
	name: "mines",
	description: "Jogo de Minas multiplayer.",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "user",
			description: "O usuário a desafiar",
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: "bet",
			description: "O valor da aposta",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			minValue: 1,
		},
	],
	async run(interaction) {
		const challenged = interaction.options.getUser("user", true);
		const bet = interaction.options.getInteger("bet", true);

		// if (challenged.id === interaction.user.id) {
		// 	await interaction.reply({
		// 		flags: ["Ephemeral"],
		// 		content: "Você não pode se desafiar.",
		// 	});
		// 	return;
		// }

		const db = new QuickDB();
		const balance = (await db.get(`coins.${interaction.user.id}`)) ?? 0;

		if (balance < bet) {
			await interaction.reply({
				flags: ["Ephemeral"],
				content: "Você não tem moedas suficientes.",
			});
			return;
		}

		const acceptButton = new ButtonBuilder({
			customId: `mines_accept/${interaction.user.id}/${challenged.id}/${bet}`,
			label: "Aceitar",
			style: ButtonStyle.Success,
		});

		const denyButton = new ButtonBuilder({
			customId: `mines_deny/${interaction.user.id}/${challenged.id}/${bet}`,
			label: "Cancelar",
			style: ButtonStyle.Danger,
		});

		const row = createRow(acceptButton, denyButton);

		await interaction.reply({
			content: `${challenged}, você foi desafiado para um jogo de Minas por ${interaction.user} com aposta de ${bet} moedas.`,
			components: [row],
			withResponse: true,
		});

		setTimeout(async () => {
			try {
				const message = await interaction.fetchReply();
				if (message.components.length >= 5) return;

				const disabledAccept = acceptButton.setDisabled(true);
				const disabledDeny = denyButton.setDisabled(true);
				const disabledRow = createRow(disabledAccept, disabledDeny);

				await message.edit({
					content: `⏰ O desafio para ${challenged} expirou.\n-# 1 minuto sem resposta.`,
					components: [disabledRow],
				});
			} catch (error) {
				console.error("Erro ao editar mensagem de timeout do desafio:", error);
			}
		}, 3 * 1000);
	},
});
