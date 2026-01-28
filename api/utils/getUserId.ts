import { verify } from "jsonwebtoken";
import { botModel } from "../models/Bot";
import type { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import { GENERICS } from "../utils/errors.json";

export const getUserId = async (auth: string | undefined, res: Response, req?: Request): Promise<string | void> => {
    const { Unauthorized } = HttpStatusCode;
    const { MISSING_AUTHORIZATION_ERROR, INVALID_AUTH, INVALID_AUTH_PREFIX } =
        GENERICS;

    if (!auth && req?.cookies?.discordUser) {
        try {
            const decoded = verify(
                req.cookies.discordUser,
                process.env.JWT_SECRET as string
            ) as { userId: string };
            return decoded.userId;
        } catch (error) {
            res.status(Unauthorized).json({ message: "Token inválido ou expirado" });
            return;
        }
    }

    if (!auth) {
        res.status(Unauthorized).json(MISSING_AUTHORIZATION_ERROR);
        return;
    }
    
    if (!/(Bot|User)\s.+/.test(auth)) {
        res.status(Unauthorized).json(INVALID_AUTH_PREFIX);
        return;
    }

    if (auth.startsWith("User")) {
        try {
            const decoded = verify(
                auth.slice(5),
                process.env.JWT_SECRET as string
            ) as { userId: string };

            return decoded.userId;
        } catch (error) {
            res.status(Unauthorized).json(INVALID_AUTH);
            return;
        }
    } else {
        const bot = await botModel.findOne(
            { api_key: auth.slice(4) },
            { owner_id: 1 }
        );

        if (!bot) {
            res.status(Unauthorized).json(INVALID_AUTH);
            return;
        }

        return bot.owner_id;
    }
};