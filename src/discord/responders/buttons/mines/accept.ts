import { ResponderType, createResponder } from "#base";
import { buildBoard } from "functions/mines/board.js";
import { QuickDB } from "quick.db";
import z from "zod";

export const confirmSchema = z.object({
	challenger: z.string(),
	challenged: z.string(),
	bet: z.coerce.number(),
});

createResponder({
	customId: "mines_accept/:challenger/:challenged/:bet",
	types: [ResponderType.Button],
	parse: confirmSchema.parse,
	cache: "cached",
	async run(interaction, { challenger, challenged, bet }) {
		if (interaction.user.id !== challenged) {
			await interaction.reply({
				flags: ["Ephemeral"],
				content: "Este botão não é para você.",
			});
			return;
		}

		const db = new QuickDB();

		const balance = (await db.get(`coins.${challenged}`)) ?? 0;
		if (balance < bet) {
			await interaction.update({
				content: "Você não tem moedas suficientes.",
				components: [],
			});
			return;
		}

		await db.sub(`coins.${challenger}`, bet);
		await db.sub(`coins.${challenged}`, bet);

		const gameId = interaction.message.id;
		const size = 5;
		const numMines = 5;
		const mines = new Set<number>();
		while (mines.size < numMines) {
			const pos = Math.floor(Math.random() * size * size);
			mines.add(pos);
		}

		const isMine = Array.from({ length: size }, () => Array(size).fill(false));
		for (const pos of mines) {
			const r = Math.floor(pos / size);
			const c = pos % size;
			isMine[r][c] = true;
		}

		const numbers = Array.from({ length: size }, () => Array(size).fill(0));
		for (let r = 0; r < size; r++) {
			for (let c = 0; c < size; c++) {
				if (isMine[r][c]) continue;
				let count = 0;
				for (let dr = -1; dr <= 1; dr++) {
					for (let dc = -1; dc <= 1; dc++) {
						if (dr === 0 && dc === 0) continue;
						const nr = r + dr;
						const nc = c + dc;
						if (
							nr >= 0 &&
							nr < size &&
							nc >= 0 &&
							nc < size &&
							isMine[nr][nc]
						) {
							count++;
						}
					}
				}
				numbers[r][c] = count;
			}
		}

		const revealed = Array.from({ length: size }, () =>
			Array(size).fill(false),
		);
		const player1 = challenger;
		const player2 = challenged;
		const currentTurn = player1;
		const game = {
			player1,
			player2,
			currentTurn,
			bet,
			isMine,
			numbers,
			revealed,
			over: false,
			winner: null,
		};
		await db.set(`games.${gameId}`, game);

		const components = buildBoard(gameId, game);
		const content = `Jogo de Mines iniciado!\nJogadores: <@${player1}> vs <@${player2}>\nAposta: ${bet} moedas cada\nVez: <@${currentTurn}>`;

		await interaction.update({ content, components });
	},
});
