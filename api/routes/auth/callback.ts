import { sign, verify } from "jsonwebtoken";
import { HttpStatusCode } from "axios";
import { userModel } from "../../models/User";
import type { Request, Response } from "express";
import { GENERICS } from "../../utils/errors.json";
import { webhooks } from "../../utils/webhooks";
import { PremiumType } from "../../typings/types";

export const callback = async (req: Request, res: Response) => {
    const {
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI,
        SCOPES,
        REDIRECT_AUTH,
        AUTH_LINK,
        JWT_SECRET,
    } = process.env;
    const { code } = req.query;
    const path = req.path;

    const codeParam = Array.isArray(code) ? code[0] : code;

    if (!codeParam) {
        return res.redirect(AUTH_LINK as string);
    }

    const data = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET as string,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI as string,
        scope: JSON.parse(SCOPES as string).join(" "),
    };

    const { method } = req.params;

    if (path.includes("user")) {
        try {
            const decoded = verify(
                req.cookies.discordUser,
                JWT_SECRET as string
            ) as { userId: string };

            const user = await userModel.findById(decoded.userId, {
                _id: 1,
                username: 1,
                avatar: 1,
                premium_type: 1,
            });

            if (!user) {
                res.clearCookie("discordUser", {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    domain: ".simobotlist.online",
                    path: "/",
                });
                return res.status(HttpStatusCode.Unauthorized).json({
                    message: "Usuário não encontrado. Faça login novamente.",
                });
            }

            return res.status(HttpStatusCode.Ok).json({
                id: user._id,
                username: user.username,
                avatar: user.avatar,
                premium_type: user.premium_type,
            });
        } catch (error) {
            res.clearCookie("discordUser", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: ".simobotlist.online",
                path: "/",
            });
            return res.status(HttpStatusCode.Unauthorized).json({
                message: "Sessão inválida ou expirada",
            });
        }
    }

    if (path.includes("logout")) {
        try {
            res.clearCookie("discordUser", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: ".simobotlist.online",
                path: "/",
            });

            return res.status(HttpStatusCode.Ok).json(GENERICS.SUCCESS);
        } catch (error) {
            return res
                .status(HttpStatusCode.BadRequest)
                .json(GENERICS.DISCORD_AUTH_ERROR);
        }
    }

    if (path.includes("callback")) {
        try {
            const tokenReq = await fetch(
                "https://discord.com/api/v10/oauth2/token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams(
                        data as unknown as Record<string, string>
                    ),
                }
            );
            const response = await tokenReq.json();

            if (response.error === "invalid_grant")
                return res.redirect(AUTH_LINK as string);

            const accessToken = response.access_token;
            const userReq = await fetch(
                "https://discord.com/api/v10/users/@me",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const discordUser = await userReq.json();

            if (!discordUser.id) {
                return res
                    .status(HttpStatusCode.BadRequest)
                    .json(GENERICS.DISCORD_AUTH_ERROR);
            }

            const { username, id, avatar } = discordUser;
            const sevenDays = 604800000;

            const token = sign({ userId: id }, JWT_SECRET as string, {
                expiresIn: sevenDays,
            });

            const existingUser = await userModel.findById(id);

            if (existingUser) {
                await userModel.findByIdAndUpdate(id, {
                    username,
                    avatar,
                });
            } else {
                await userModel.create({
                    _id: id,
                    username,
                    avatar,
                    premium_type: PremiumType.None,
                });
            }

            res.cookie("discordUser", token, {
                maxAge: sevenDays,
                httpOnly: true,
                secure: true,
                sameSite: "none",
                domain: ".simobotlist.online",
                path: "/",
            });

            res.redirect(REDIRECT_AUTH as string);

            await webhooks.login({
                avatar: avatar,
                id: id,
                token: token,
                username: username,
            });
        } catch (error) {
            res.status(HttpStatusCode.BadRequest).json(
                GENERICS.DISCORD_AUTH_ERROR
            );
        }
    }
};