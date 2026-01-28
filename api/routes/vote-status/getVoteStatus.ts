import { HttpStatusCode } from "axios";
import { botModel } from "../../models/Bot";
import { BOT, USER } from "../../utils/errors.json";
import type { Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { userModel } from "../../models/User";
import { PremiumConfigurations } from "../../utils/PremiumConfigurations";
import { sanitizeAuth } from "../../utils/sanitizeAuth";

export const getVoteStatus = async (req: Request, res: Response) => {
    const auth = sanitizeAuth(req.headers.authorization as string);
    const isUsingJwt = req.headers.authorization?.startsWith("User");

    let userId: string;
    let botId: string;

    if (isUsingJwt) {
        try {
            const decoded = verify(auth as string, process.env.JWT_SECRET!) as JwtPayload;
            userId = decoded.id;
            botId = req.params.botId;
        } catch (error) {
            return res.status(HttpStatusCode.Unauthorized).json({
                error: "INVALID_TOKEN",
                message: "Token JWT inválido ou expirado"
            });
        }
    } else {
        const bot = await botModel.findOne({ api_key: auth }).select('_id');
        
        if (!bot) {
            return res.status(HttpStatusCode.Unauthorized).json({
                error: "INVALID_API_KEY",
                message: "API Key inválida"
            });
        }

        botId = bot._id.toString();
        userId = req.params.userId;
    }

    const user = await userModel.findById(userId);
    if (!user) {
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);
    }

    const bot = await botModel.findById(botId);
    if (!bot) {
        return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);
    }

    const vote = bot.votes.find((vote) => vote.user_id === userId);

    if (!vote) {
        return res.status(HttpStatusCode.Ok).json({ 
            can_vote: true, 
            rest_time: null 
        });
    }

    const baseHours = PremiumConfigurations[user.premium_type].cooldown_vote;
    const timeLeft = Date.now() - new Date(vote.last_vote).getTime();

    return res.status(HttpStatusCode.Ok).json({
        can_vote: timeLeft > baseHours,
        rest_time: timeLeft > baseHours ? null : baseHours - timeLeft,
    });
};