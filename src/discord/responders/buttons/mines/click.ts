import { ResponderType, createResponder } from "#base";
import { buildBoard, floodReveal } from "functions/mines/board.js";
import { QuickDB } from "quick.db";
import { z } from "zod";

const clickSchema = z.object({
	gameId: z.string(),
	row: z.coerce.number(),
	col: z.coerce.number(),
});

createResponder({
	customId: "mines_click/:gameId/:row/:col",
	types: [ResponderType.Button],
	parse: clickSchema.parse,
	cache: "cached",
	async run(interaction, { gameId, row, col }) {
		const db = new QuickDB();

		const game = await db.get(`games.${gameId}`);
		if (!game || game.over) {
			await interaction.reply({
				flags: ["Ephemeral"],
				content: "Jogo não encontrado ou finalizado.",
			});
			return;
		}
		if (interaction.user.id !== game.currentTurn) {
			await interaction.reply({
				flags: ["Ephemeral"],
				content: "Não é sua vez.",
			});
			return;
		}
		if (game.revealed[row][col]) {
			await interaction.reply({
				flags: ["Ephemeral"],
				content: "Célula já revelada.",
			});
			return;
		}
		if (game.isMine[row][col]) {
			game.revealed[row][col] = true;
			game.over = true;
			game.winner =
				game.currentTurn === game.player1 ? game.player2 : game.player1;

			await db.add(`coins.${game.winner}`, game.bet * 2);

			const components = buildBoard(gameId, game, true, true);
			const content = `Jogo de Minas\nJogadores: <@${game.player1}> vs <@${game.player2}>\nAposta: ${game.bet} moedas cada\n<@${game.currentTurn}> acertou uma mina! <@${game.winner}> venceu e ganhou ${game.bet * 2} moedas!`;

			await db.delete(`games.${gameId}`);
			await interaction.update({ content, components });

			return;
		} else {
			floodReveal(game, row, col);

			const size = 5;
			const numMines = 5;
			let revealedCount = 0;

			for (let rr = 0; rr < size; rr++) {
				for (let cc = 0; cc < size; cc++) {
					if (game.revealed[rr][cc] && !game.isMine[rr][cc]) revealedCount++;
				}
			}

			if (revealedCount === size * size - numMines) {
				game.over = true;

				await db.add(`coins.${game.player1}`, game.bet);
				await db.add(`coins.${game.player2}`, game.bet);

				const components = buildBoard(gameId, game, true, true);
				const content = `Jogo de Minas\nJogadores: <@${game.player1}> vs <@${game.player2}>\nAposta: ${game.bet} moedas cada\nTodas as células seguras foram reveladas! Empate! Moedas devolvidas.`;
				await interaction.update({ content, components });

				await db.delete(`games.${gameId}`);

				return;
			}

			game.currentTurn =
				game.currentTurn === game.player1 ? game.player2 : game.player1;
			await db.set(`games.${gameId}`, game);

			const components = buildBoard(gameId, game);
			const content = `Jogo de Minas\nJogadores: <@${game.player1}> vs <@${game.player2}>\nAposta: ${game.bet} moedas cada\nVez: <@${game.currentTurn}>`;

			await interaction.update({ content, components });
		}
	},
});
