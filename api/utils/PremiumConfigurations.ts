import { PremiumType } from "../typings/types";

export const PremiumConfigurations = {
    [PremiumType.Advanced]: {
        cooldown_vote: 4 * 60 * 60 * 1000,
        teams_count: 20,
        bots_count: 20,
        max_members_in_team: 75,
        team_capacity_limit: 150,
    },
    [PremiumType.Basic]: {
        cooldown_vote: 8 * 60 * 60 * 1000,
        teams_count: 10,
        bots_count: 10,
        max_members_in_team: 30,
        team_capacity_limit: 50,
    },
    [PremiumType.None]: {
        cooldown_vote: 12 * 60 * 60 * 1000,
        teams_count: 3,
        bots_count: 3,
        max_members_in_team: 10,
        team_capacity_limit: 15,
    },
};