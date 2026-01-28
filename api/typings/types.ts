import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export type Snowflake = string;

export interface BotStructure {
    _id: Snowflake;
    name: string;
    avatar: string | null;
    invite_url: string;
    website_url?: string;
    support_server?: string;
    source_code?: string;
    short_description: string;
    long_description: string;
    prefixes: string[];
    owner_id: Snowflake;
    created_at: string;
    verified: boolean;
    tags: string[];
    approved: boolean;
    api_key?: string;
    votes: VoteStructure[];
    team_id?: string;
    vote_message?: string;
    webhook_url?: string;
}

export interface UserStructure {
    _id: Snowflake;
    username: string;
    avatar: string | null;
    notifications: Map<string, NotificationBody>;
    bio?: string;
    notifications_viewed: boolean;
    banner_url?: string;
    flags: UserFlags;
    premium_type: PremiumType;
    locale?: Locales;
}

export enum Locales {
    PortugueseBr = "pt-BR",
    EnglishUS = "en-US",
    Spanish = "es-ES",
}

export interface Team {
    members: TeamMember[];
    id: string;
    invite_code: string;
    name: string;
    avatar_url: string;
    description: string;
    bots_id: Snowflake[];
    vanity_url?: VanityURLStructure;
    created_at: string;
    banner_url?: string;
}

export interface VanityURLStructure {
    code: string;
    uses: number;
}

export interface TeamMember {
    id: Snowflake;
    permission: TeamPermissions;
    joined_at: string;
}

export enum TeamPermissions {
    Administrator,
    ReadOnly,
    Owner,
}

export interface DiscordUserStructure extends Omit<UserStructure, "_id"> {
    id: Snowflake;
}

export interface VoteStructure {
    votes: number;
    user_id: Snowflake;
    last_vote: string;
}

export interface FeedbackStructure {
    author_id: string;
    stars: number;
    posted_at: string;
    content: string;
    target_bot_id: Snowflake;
    edited?: boolean;
    reply_message?: {
        content: string;
        posted_at: string;
        edited?: boolean;
    };
}

export interface NotificationBody {
    content: string;
    sent_at: string;
    type: NotificationType;
    url?: string;
}

export enum NotificationType {
    Comment,
    ApprovedBot,
    RefusedBot,
    Mixed,
}

export interface BaseStructure<Id = Snowflake> {
    _id: Id;
}

export interface AuditLogStructure extends BaseStructure {
    entries: AuditLogEntryStructure[];
}

export interface AuditLogEntryStructure {
    executor_id: Snowflake;
    created_at: string;
    id: string;
    action_type: AuditLogActionType;
    changes: AnyAuditLogChange[];
    target_id?: Snowflake;
    reason?: string;
}

export enum AuditLogActionType {
    MemberAdd,
    MemberRemove,
    MemberUpdate,
    TeamOwnershipTransfer,
    TeamUpdate,
    BotAdd,
    BotRemove,
    InviteUpdate,
    MemberAutoKick,
}

export type AnyAuditLogChange =
    | AuditLogInviteUpdateChange
    | AuditLogBotAddChange
    | AuditLogBotRemoveChange
    | AuditLogTeamUpdateChange
    | AuditLogMemberAddChange
    | AuditLogMemberRemoveChange
    | AuditLogMemberUpdateChange
    | AuditLogTeamOwnershipTransferChange
    | AuditLogVanityURLUpdateChange;

export type AuditLogVanityURLUpdateChange = BaseAuditLogChange<
    "vanity_url",
    { code: string }
>;

export type AuditLogMemberAddChange = BaseAuditLogChange<never, never>;
export type AuditLogMemberRemoveChange = AuditLogMemberAddChange;

export type AuditLogMemberUpdateChange = BaseAuditLogChange<
    "permission",
    TeamPermissions
>;

export type AuditLogTeamOwnershipTransferChange = BaseAuditLogChange<
    "id",
    Snowflake
>;

export type AuditLogTeamUpdateChange = BaseAuditLogChange<
    "name" | "description" | "avatar_url",
    string
>;

export type AuditLogBotAddChange = BaseAuditLogChange<"bot_id", Snowflake>;
export type AuditLogBotRemoveChange = AuditLogBotAddChange;

export type AuditLogInviteUpdateChange = BaseAuditLogChange<
    "invite_code",
    string
>;

export type BaseAuditLogChange<Key, Data> = {
    changed_key: Key;
    old_value: Data;
    new_value?: Data;
};

export enum UserFlags {
    None = 0,
    BugHunter = 1 << 0,
    Contributor = 1 << 1,
    PremiumPartner = 1 << 2,
    Developer = 1 << 3,
}

export enum PremiumType {
    None,
    Basic,
    Advanced,
}

export enum Events {
    Error,
    Hello,
    Ready,

    UserUpdate,
    BulkDeleteNotifications,
    NotificationDelete,
    NotificationCreate,

    TeamCreate = 10,
    TeamDelete,
    TeamUpdate,
    TeamOwnershipTransfer,
    MemberJoin,
    TeamBotRemove,
    MemberLeave,
    TeamMemberUpdate,
    InviteCodeUpdate,
    TeamBotAdd,
    AuditLogEntryCreate,

    BotCreate = 30,
    BotDelete,
    BotUpdate,
    FeedbackDelete,
    FeedbackUpdate,
    VoteAdd,
    FeedbackAdd,
}

export const APIEvents = {
    [Events.UserUpdate]: "userUpdate",
    [Events.BulkDeleteNotifications]: "bulkDeletNotifications",
    [Events.NotificationDelete]: "notificationDelete",
    [Events.NotificationCreate]: "notificationCreate",
    [Events.TeamCreate]: "teamCreate",
    [Events.TeamDelete]: "teamDelete",
    [Events.TeamUpdate]: "teamUpdate",
    [Events.TeamOwnershipTransfer]: "teamOwnershipTransfer",
    [Events.MemberJoin]: "memberJoin",
    [Events.TeamBotRemove]: "teamBotRemove",
    [Events.MemberLeave]: "memberLeave",
    [Events.TeamMemberUpdate]: "teamMemberUpdate",
    [Events.InviteCodeUpdate]: "inviteCodeUpdate",
    [Events.TeamBotAdd]: "teamBotAdd",
    [Events.BotCreate]: "botCreate",
    [Events.BotDelete]: "botDelete",
    [Events.BotUpdate]: "botUpdate",
    [Events.FeedbackDelete]: "feedbackDelete",
    [Events.FeedbackUpdate]: "feedbackUpdate",
    [Events.VoteAdd]: "voteAdd",
    [Events.FeedbackAdd]: "feedbackAdd",
    [Events.AuditLogEntryCreate]: "auditLogEntryCreate",
    [Events.Error]: "error",
    [Events.Hello]: "hello",
    [Events.Ready]: "ready",
};

export interface SocketOptions {
    auth: string;
    events: Events[];
}

export interface SocketConnectionStructure {
    id: string;
    logged: boolean;
    data: SocketOptions | null;
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    connected: boolean;
}

export enum Opcodes {
    Payload,
    Hello,
    InvalidConnection,
}

export interface AnyEventData {
    type: Opcodes;
    event_type: Events | null;
    payload: object | null;
}
