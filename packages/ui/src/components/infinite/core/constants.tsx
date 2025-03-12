"use client";

import type { Option } from "../../data-table-v2/core/types";
import { cn } from "../../../lib/utils";
import { format } from "date-fns";

// Constants
export const LEVELS = ["error", "warning", "info", "debug", "trace"] as const;
export const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"] as const;
export const REGIONS = ["us-east-1", "us-west-1", "eu-west-1", "ap-northeast-1"] as const;

// Flags mapping
export const flags: Record<string, string> = {
    "us-east-1": "🇺🇸",
    "us-west-1": "🇺🇸",
    "eu-west-1": "🇪🇺",
    "ap-northeast-1": "🇯🇵",
};

// Regions mapping
export const regions: Record<string, string> = {
    "us-east-1": "N. Virginia",
    "us-west-1": "N. California",
    "eu-west-1": "Ireland",
    "ap-northeast-1": "Tokyo",
};

// Utility functions
export function getLevelColor(level: (typeof LEVELS)[number]) {
    switch (level) {
        case "error":
            return { bg: "bg-destructive", text: "text-destructive" };
        case "warning":
            return { bg: "bg-warning", text: "text-warning" };
        case "info":
            return { bg: "bg-info", text: "text-info" };
        case "debug":
            return { bg: "bg-muted", text: "text-muted-foreground" };
        case "trace":
            return { bg: "bg-accent", text: "text-accent-foreground" };
        default:
            return { bg: "bg-muted", text: "text-muted-foreground" };
    }
}

export function getLevelLabel(level: (typeof LEVELS)[number]) {
    return level.charAt(0).toUpperCase() + level.slice(1);
}

export function getStatusColor(status: number) {
    if (status >= 500) {
        return { bg: "bg-destructive", text: "text-destructive" };
    }
    if (status >= 400) {
        return { bg: "bg-warning", text: "text-warning" };
    }
    if (status >= 300) {
        return { bg: "bg-info", text: "text-info" };
    }
    if (status >= 200) {
        return { bg: "bg-success", text: "text-success" };
    }
    return { bg: "bg-muted", text: "text-muted-foreground" };
}

export function formatMilliseconds(ms: number): string {
    if (ms < 1) {
        return `${Math.round(ms * 1000)}μs`;
    }

    if (ms < 1000) {
        return `${Math.round(ms)}ms`;
    }

    const seconds = ms / 1000;
    if (seconds < 60) {
        return `${seconds.toFixed(2)}s`;
    }

    const minutes = seconds / 60;
    return `${minutes.toFixed(2)}m`;
}

// Timing phases
export const timingPhases = [
    { key: "timing.dns", label: "DNS", color: "bg-blue-500" },
    { key: "timing.connection", label: "Connection", color: "bg-green-500" },
    { key: "timing.tls", label: "TLS", color: "bg-yellow-500" },
    { key: "timing.ttfb", label: "TTFB", color: "bg-orange-500" },
    { key: "timing.transfer", label: "Transfer", color: "bg-red-500" },
];

export function getTimingColor(key: string) {
    const phase = timingPhases.find((phase) => phase.key === key);
    return phase?.color || "bg-muted";
}

export function getTimingLabel(key: string) {
    const phase = timingPhases.find((phase) => phase.key === key);
    return phase?.label || key;
}

export function getTimingPercentage(timing: Record<string, number>, latency: number) {
    const result: Record<string, number> = {};

    for (const phase of timingPhases) {
        const value = timing[phase.key as keyof typeof timing] || 0;
        result[phase.key] = latency > 0 ? (value / latency) * 100 : 0;
    }

    return result;
}

// Delimiter constants
export const ARRAY_DELIMITER = ",";
export const RANGE_DELIMITER = "~";
export const SLIDER_DELIMITER = ":"; 