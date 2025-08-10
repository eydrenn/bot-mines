import { createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle } from "discord.js";

export function buildBoard(
	gameId: string,
	game: any,
	disableAll = false,
	revealMines = false,
) {
	const rows = [];
	const numberEmojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];
	for (let r = 0; r < 5; r++) {
		const btns = [];
		for (let c = 0; c < 5; c++) {
			const btn = new ButtonBuilder().setCustomId(
				`mines_click/${gameId}/${r}/${c}`,
			);
			if (revealMines && game.isMine[r][c]) {
				btn.setEmoji("💥").setStyle(ButtonStyle.Danger).setDisabled(true);
			} else if (game.revealed[r][c]) {
				if (game.isMine[r][c]) {
					btn.setEmoji("💥").setStyle(ButtonStyle.Danger).setDisabled(true);
				} else {
					const num = game.numbers[r][c];
					btn
						.setEmoji(num > 0 ? numberEmojis[num] : "🟦")
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true);
				}
			} else {
				btn
					.setEmoji("⬛")
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(disableAll);
			}
			btns.push(btn);
		}
		rows.push(createRow(...btns));
	}
	return rows;
}

export function floodReveal(game: any, r: number, c: number) {
	const size = 5;
	const stack = [[r, c]];
	while (stack.length) {
		const pos = stack.pop();
		if (!pos) continue;
		const [cr, cc] = pos;
		if (game.revealed[cr][cc]) continue;
		game.revealed[cr][cc] = true;
		if (game.numbers[cr][cc] !== 0) continue;
		for (let dr = -1; dr <= 1; dr++) {
			for (let dc = -1; dc <= 1; dc++) {
				if (dr === 0 && dc === 0) continue;
				const nr = cr + dr;
				const nc = cc + dc;
				if (
					nr >= 0 &&
					nr < size &&
					nc >= 0 &&
					nc < size &&
					!game.isMine[nr][nc] &&
					!game.revealed[nr][nc]
				) {
					stack.push([nr, nc]);
				}
			}
		}
	}
}
