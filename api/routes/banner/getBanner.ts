import { Request, Response } from "express";
import puppeteer from "puppeteer";
import { botModel } from "../../models/Bot";

export const getBanner = async (req: Request, res: Response) => {
  try {
    const botId = req.params.id;
    if (!botId) return res.status(400).send("Bot ID não fornecido");

    const bot = await botModel.findById(botId).catch(() => null);
    if (!bot) return res.status(404).send("Bot não encontrado");

    const { name, avatar, votes, short_description } = bot;
    const avatarUrl = `https://cdn.discordapp.com/avatars/${botId}/${avatar}.png?size=512`;

    const html = `
      <html>
        <head>
          <style>
            body {
              width: 1200px;
              height: 630px;
              margin: 0;
              padding: 60px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              font-family: Inter, sans-serif;
              background: linear-gradient(135deg, #00d4ff 0%, #007aff 100%);
              color: #fff;
            }
            .top { display: flex; align-items: center; gap: 20px; }
            .center { display: flex; align-items: center; gap: 30px; }
            .center img { border-radius: 50%; border: 5px solid #fff; }
            .center div { display: flex; flex-direction: column; }
            .center div h1 { font-size: 72px; margin: 0; }
            .center div p { margin: 5px 0; font-size: 28px; color: rgba(255,255,255,0.85); }
            .footer { font-size: 28px; opacity: 0.8; text-align: center; width: 100%; }
          </style>
        </head>
        <body>
          <div class="top">
            <img src="https://simo-botlist.vercel.app/assets/imagens/simo-azul.png" width="60" height="60"/>
            <span style="font-size: 40px; font-weight: 700;">Feito com Simo</span>
          </div>

          <div class="center">
            <img src="${avatarUrl}" width="160" height="160"/>
            <div>
              <h1>${name}</h1>
              <p>⭐ ${votes ?? 0} votos</p>
              <p>${short_description || "Um bot incrível disponível na Simo Botlist!"}</p>
            </div>
          </div>

          <div class="footer">
            Apresente seu projeto para o mundo dos devs com a Simo Botlist 💫
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    const buffer = await page.screenshot({ type: "png" });
    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao gerar banner");
  }
};
