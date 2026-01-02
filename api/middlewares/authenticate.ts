import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { HttpStatusCode } from "axios";

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies.discordUser;

        if (!token) {
            return res
                .status(HttpStatusCode.Unauthorized)
                .json({ message: "Não autenticado" });
        }

        const decoded = verify(token, process.env.JWT_SECRET as string) as {
            userId: string;
        };

        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.clearCookie("discordUser");
        return res
            .status(HttpStatusCode.Unauthorized)
            .json({ message: "Token inválido" });
    }
};