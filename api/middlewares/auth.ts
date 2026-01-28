import { Request, Response, NextFunction } from "express";
import { verify, JwtPayload } from "jsonwebtoken";
import { HttpStatusCode } from "axios";
import { botModel } from "../models/Bot";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            botId?: string;
        }
    }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("User ")) {
        return res.status(HttpStatusCode.Unauthorized).json({
            error: "MISSING_TOKEN",
            message: "Token de autenticação não fornecido"
        });
    }

    const token = auth.replace("User ", "").trim();

    try {
        const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(HttpStatusCode.Unauthorized).json({
            error: "INVALID_TOKEN",
            message: "Token inválido ou expirado"
        });
    }
};

export const authenticateBotAPIKey = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers.authorization;

    if (!apiKey) {
        return res.status(HttpStatusCode.Unauthorized).json({
            error: "MISSING_API_KEY",
            message: "API Key não fornecida"
        });
    }

    try {
        const bot = await botModel.findOne({ api_key: apiKey }).select('_id');
        
        if (!bot) {
            return res.status(HttpStatusCode.Unauthorized).json({
                error: "INVALID_API_KEY",
                message: "API Key inválida"
            });
        }

        req.botId = bot._id.toString();
        next();
    } catch (error) {
        return res.status(HttpStatusCode.InternalServerError).json({
            error: "AUTH_ERROR",
            message: "Erro ao validar API Key"
        });
    }
};