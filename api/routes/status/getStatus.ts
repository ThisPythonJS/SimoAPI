import { HttpStatusCode } from "axios";
import { freemem, totalmem, cpus, loadavg, platform, arch } from "os";
import { botModel } from "../../models/Bot";
import { userModel } from "../../models/User";
import type { Request, Response } from "express";
import { uptime, requestCount } from "../../index";
import mongoose from "mongoose";

let lastCount = Date.now();
let bots: number | undefined;
let users: number | undefined;

async function getCount() {
    const [botsCount, usersCount] = await Promise.all([
        botModel.countDocuments(),
        userModel.countDocuments(),
    ]);
    bots = botsCount;
    users = usersCount;
}

export const getStatus = async (_: Request, res: Response) => {
    if (!bots) {
        await getCount();
    }
    
    const MINUTE_IN_MILLISECONDS = 60000;
    if (Date.now() - lastCount > MINUTE_IN_MILLISECONDS) {
        await getCount();
        lastCount = Date.now();
    }

    const totalMemMB = totalmem() / (1024 * 1024);
    const freeMemMB = freemem() / (1024 * 1024);
    const usedMemMB = totalMemMB - freeMemMB;
    const memUsagePercent = (usedMemMB / totalMemMB) * 100;
    
    const cpuCores = cpus().length;
    const loadAverage = loadavg();
    
    const uptimeMs = Date.now() - uptime;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    const uptimeDays = Math.floor(uptimeSeconds / 86400);
    const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
    
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    
    const healthStatus = 
        memUsagePercent < 90 && 
        dbStatus === "connected" && 
        mongoose.connection.readyState === 1
            ? "healthy"
            : "degraded";

    return res.status(HttpStatusCode.Ok).json({
        status: healthStatus,
        timestamp: Date.now(),
        memory: {
            total_mb: Math.round(totalMemMB),
            free_mb: Math.round(freeMemMB),
            used_mb: Math.round(usedMemMB),
            usage_percent: Math.round(memUsagePercent * 100) / 100
        },
        cpu: {
            cores: cpuCores,
            model: cpus()[0]?.model || "Unknown",
            load_average: {
                "1min": Math.round(loadAverage[0] * 100) / 100,
                "5min": Math.round(loadAverage[1] * 100) / 100,
                "15min": Math.round(loadAverage[2] * 100) / 100
            }
        },
        system: {
            platform: platform(),
            arch: arch(),
            node_version: process.version
        },
        database: {
            status: dbStatus,
            name: mongoose.connection.name || "N/A"
        },
        statistics: {
            users,
            bots,
            request_count: requestCount
        },
        uptime: {
            milliseconds: uptimeMs,
            formatted: `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`,
            started_at: uptime
        },
        thanks_to: {
            furstxd4: "Por ter criado um Pull Request"
        }
    });
};
