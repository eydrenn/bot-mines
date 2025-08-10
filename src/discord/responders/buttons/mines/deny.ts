import { ResponderType, createResponder } from "#base";
import { confirmSchema } from "./accept.js";

createResponder({
	customId: "mines_deny/:challenger/:challenged/:bet",
	types: [ResponderType.Button],
	parse: confirmSchema.parse,
	cache: "cached",
	async run(interaction, { challenged }) {
		if (
			interaction.user.id !== challenged &&
			!interaction.member.permissions.has("Administrator")
		) {
			await interaction.reply({
				flags: ["Ephemeral"],
				content: "Este botão não é para você.",
			});
			return;
		}

		await interaction.update({
			content: `Desafio recusado contra <@${challenged}>.`,
			components: [],
		});
	},
});
