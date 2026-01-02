import { BotStructure } from "../typings/types";

interface WebhookUserStructure {
    id: string;
    avatar: string;
    token: string;
    username: string;
}

export const webhooks = {
    logs: (botData: BotStructure): Promise<Response> => {
        return fetch(process.env.WEBHOOK_ADDBOT as string, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                content: `<@${botData.owner_id}>`,
                embeds: [
                    {
                        title: `<:send:1456727672251224226> ${botData.name} foi enviado para a análise.`,
                        color: 0x054f77
                    }
                ]
            }),
        });
    },
    bot: (botData: BotStructure, createdAt: number): Promise<Response> => {
        return fetch(process.env.WEBHOOK_BOT as string, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                embeds: [
                    {
                        description: `
## <:bot:1456728522319073310> [${botData.name}](https://discord.com/api/oauth2/authorize?client_id=${botData._id}&scope=bot%20applications.commands&permissions=0)
- **ID**
-# ╰ **\`${botData._id}\`**
- **Prefixo**
-# ╰ **\`${botData.prefixes.join(", ")}\`**
- **Descrição**
-# ╰ **\`${botData.short_description}\`**
- **Data de Criação**
-# ╰ **<t:${createdAt}:F> (<t:${createdAt}:R>)**
`,
                        color: 0x054f77,
                        thumbnail: {
                            url: `https://cdn.discordapp.com/avatars/${botData._id}/${botData.avatar}.png`,
                        },
                    },
                ],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 5,
                                label: "Adicionar Bot",
                                url: `https://discord.com/api/oauth2/authorize?client_id=${botData._id}&scope=bot%20applications.commands&permissions=0`,
                                emoji: {
                                    name: "addbot",
                                    id: "1456731669473005578"
                                }
                            }
                        ]
                    }
                ]
            }),
        });
    },
    raw: (botData: BotStructure): Promise<Response> => {
        botData.long_description = botData.long_description.slice(0, 900);

        return fetch(process.env.WEBHOOK_RAW as string, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                content: `\`\`\`json\n${JSON.stringify(
                    botData,
                    null,
                    "\t"
                )}\`\`\``,
            }),
        });
    },
    login: (userData: WebhookUserStructure): Promise<Response> => {
        return fetch(process.env.WEBHOOK_LOGIN as string, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                embeds: [
                    {
                        title: "Login Logs",
                        color: 0x054f77,
                        fields: [
                            {
                                name: "Informações",
                                value: `O usuario **${userData.username}**, com o ID: **${userData.id}** fez um novo login.`,
                                inline: false,
                            },
                            {
                                name: "Sessão",
                                value: `A sessão do usuário expira <t:${Math.round(
                                    Date.now() / 1000 + 604800
                                )}:R>.`,
                                inline: false,
                            },
                            {
                                name: "JsonWebtoken",
                                value: `O JWT da sessão atual é: ||${userData.token}||`,
                                inline: false,
                            },
                        ],
                        thumbnail: {
                            url: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=2048`,
                        },
                    },
                ],
            }),
        });
    },
};
