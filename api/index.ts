import cors from "cors";
import { load as loadEnv } from "env-smart";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";
import express from "express";
import { getBot } from "./routes/bots/getBot";
import { getUser } from "./routes/users/getUser";
import { getToken } from "./routes/auth/getToken";
import { callback } from "./routes/auth/callback";
import { createBot } from "./routes/bots/createBot";
import { getStatus } from "./routes/status/getStatus";
import { deleteNotification } from "./routes/users/deleteNotification";
import { updateBotOrFeedback } from "./routes/bots/updateBotOrFeedback";
import { deleteBotOrFeedback } from "./routes/bots/deleteBotOrFeedback";
import { createToken } from "./routes/auth/createToken";
import { getVoteStatus } from "./routes/vote-status/getVoteStatus";
import { updateUser } from "./routes/users/updateUser";
import { getTeam } from "./routes/teams/getTeam";
import { createTeam } from "./routes/teams/createTeam";
import { deleteTeam } from "./routes/teams/deleteTeam";
import { updateTeam } from "./routes/teams/updateTeam";
import { joinTeam } from "./routes/teams/joinTeam";
import { fetchDiscordUser } from "./routes/discord/fetchDiscordUser";
import { getBanner } from "./routes/banner/getBanner";
import { Routes } from "./utils/Routes";
import { rateLimit } from "express-rate-limit";
import { Server } from "socket.io";
import { createServer } from "http";
import {
    APIEvents,
    Events,
    Opcodes,
    SocketConnectionStructure,
} from "./typings/types";
import { botModel } from "./models/Bot";
import { GENERICS, SOCKET } from "./utils/errors.json";
import { makeEventData } from "./utils/makeEventData";
import { logger } from "./utils/logger";

loadEnv();

const app = express();

const limiter = rateLimit({
    windowMs: 120000,
    limit: 200,
});

app.set("trust proxy", 1);
app.use(
    express.json({ strict: true }),
    cors({
        credentials: true,
        origin: ["https://simo.discloud.app", "https://simoservices.discloud.app", "https://simobotlist.online", "https://api.simobotlist.online"],
    }),
    cookieParser(),
    (_req, _res, next) => {
        requestCount++;

        next();
    },
    limiter
);

app.get(Routes.Banner, getBanner);
app.route(Routes.Users)
    .get(getUser)
    .delete(deleteNotification)
    .patch(updateUser);
app.get('/api/auth/callback', callback);
app.get('/api/auth/user', callback);
app.get('/api/auth/logout', callback);
app.get('/api/auth/token', getToken);
app.post('/api/auth/api-key/:botId', createToken);
app.route(Routes.Bots)
    .get(getBot)
    .delete(deleteBotOrFeedback)
    .patch(updateBotOrFeedback)
    .post(createBot);
app.route(Routes.APIStatus).get(getStatus);
app.route(Routes.VoteStatus).get(getVoteStatus);
app.route(Routes.Teams)
    .get(getTeam)
    .post(createTeam)
    .delete(deleteTeam)
    .patch(updateTeam)
    .put(joinTeam);
app.route(Routes.Discord).get(fetchDiscordUser);

export let requestCount = 0;

export let uptime: number;

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, async () => {
    uptime = Date.now();

    logger.database("Tentando conectar no MongoDB!");

    try {
      await connect(process.env.MONGOOSE_URL as string);
      logger.database("Conectado ao MongoDB com sucesso!")
    } catch (e) {
      logger.error(`Não foi possivel conectar ao MongoDB: ${e}`)
    }

    logger.success(`A SimoAPI foi iniciada na porta ${PORT}.`)
});

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

const server = createServer(app);
const io = new Server(server);

export const sockets = [] as SocketConnectionStructure[];

io.on("connect", (socket) => {
    sockets.push({
        id: socket.id,
        logged: false,
        data: null,
        socket,
        connected: true,
    });

    socket.on("login", async ({ auth, events }) => {
        socket.emit(
            APIEvents[Events.Hello],
            makeEventData({ type: Opcodes.Hello, payload: { auth } })
        );

        const bot = await botModel.findOne({ api_key: auth }, { __v: 0 });

        if (!bot)
            return socket.emit(
                "error",
                makeEventData({
                    type: Opcodes.InvalidConnection,
                    payload: GENERICS.INVALID_AUTH,
                })
            );
        if (
            !Array.isArray(events) ||
            !events.every((event) => Number.isInteger(event))
        )
            return socket.emit(
                "error",
                makeEventData({
                    type: Opcodes.InvalidConnection,
                    payload: SOCKET.INVALID_EVENTS,
                })
            );

        const skt = sockets.find((skt) => skt.id === socket.id);

        if (!skt)
            return socket.emit(
                "error",
                makeEventData({
                    type: Opcodes.InvalidConnection,
                    payload: SOCKET.UNKNOWN_CONNECTION,
                })
            );

        skt.logged = true;
        skt.data = { auth, events };

        const { _id: id, ...data } = bot;

        skt.socket.emit(
            "event",
            APIEvents[Events.Ready],
            makeEventData({
                type: Opcodes.Payload,
                event_type: Events.Ready,
                payload: { events, bot: { id, ...data } },
            })
        );
    });

    socket.on("disconnect", () => {
        const skt = sockets.find((skt) => skt.id === socket.id);

        if (skt) skt.connected = false;
    });
});
