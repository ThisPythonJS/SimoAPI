import { HttpStatusCode } from "axios";
import { userModel } from "../../models/User";
import type { Request, Response } from "express";
import { USER } from "../../utils/errors.json";
import { fetchUserNotifications } from "./fetchUserNotifications";
import { getUserId } from "../../utils/getUserId";
import { Cache } from "../../utils/Cache";
import type { Snowflake, UserStructure } from "../../typings/types";

const MINUTE_IN_MILLISECONDS = 60000;

const cache = new Cache<Snowflake, Omit<UserStructure, "_id"> & { id: Snowflake }>(
    MINUTE_IN_MILLISECONDS
);

export const getUser = async (req: Request, res: Response) => {
    const { method } = req.params;

    if (["@me", "notifications"].includes(method)) {
        const authorId = await getUserId(req.headers.authorization, res);

        if (typeof authorId !== "string") return;

        if (method === "@me") {
            const cachedUser = cache.get(authorId);
            if (cachedUser) {
                return res.status(HttpStatusCode.Ok).json(cachedUser);
            }

            const me = await userModel.findById(authorId, { __v: 0 });

            if (!me) {
                return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);
            }

            const { _id: id, ...userData } = me.toObject();
            const data = { id, ...userData };

            cache.set(authorId, data);

            return res.status(HttpStatusCode.Ok).json(data);
        }

        return fetchUserNotifications(res, authorId);
    }

    if (!method) {
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);
    }

    const cachedUser = cache.get(method);
    if (cachedUser) {
        return res.status(HttpStatusCode.Ok).json(cachedUser);
    }

    const user = await userModel.findById(method, { __v: 0 });

    if (!user) {
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);
    }

    const { _id: id, ...userData } = user.toObject();
    const data = { id, ...userData };

    cache.set(method, data);

    return res.status(HttpStatusCode.Ok).json(data);
};