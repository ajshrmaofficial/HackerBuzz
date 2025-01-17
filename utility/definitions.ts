export type HN_API_ITEM_TYPE = "item" | "topstories" | "newstories" | "beststories" | "askstories" | "showstories" | "jobstories";

export type HN_ITEM_TYPE = {
    id: number;
    deleted?: boolean;
    type: "job" | "story" | "comment" | "poll" | "pollopt";
    by: string;
    time: number;
    text?: string;
    dead?: boolean;
    parent?: number;
    poll?: number;
    kids?: number[];
    url?: string;
    score?: number;
    title?: string;
    parts?: number[];
    descendants?: number;
}

export type ROOT_STACK_PARAM_LIST = {
    index: undefined;
    comments: { commentIds: string[] };
}
