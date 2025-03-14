// Note: import from 'nuqs/server' to avoid the "use client" directive
import {
    ARRAY_DELIMITER,
    RANGE_DELIMITER,
    SLIDER_DELIMITER,
} from "@/lib/delimiters";
import {
    IMPORTANCE_LEVELS,
    RECURRING_TRANSACTION_STATUSES,
    RECURRING_TRANSACTION_TYPES,
    TRANSACTION_FREQUENCIES
} from "./schema";
import {
    createParser,
    createSearchParamsCache,
    parseAsArrayOf,
    parseAsBoolean,
    parseAsInteger,
    parseAsString,
    parseAsStringLiteral,
    parseAsTimestamp,
} from "nuqs/server";

export const parseAsSort = createParser({
    parse(queryValue) {
        const [id, desc] = queryValue.split(".");
        if (!id && !desc) return null;
        return { id, desc: desc === "desc" };
    },
    serialize(value) {
        return `${value.id}.${value.desc ? "desc" : "asc"}`;
    },
});

export const searchParamsParser = {
    // FILTERS
    status: parseAsArrayOf(parseAsStringLiteral(RECURRING_TRANSACTION_STATUSES), ARRAY_DELIMITER),
    transactionType: parseAsArrayOf(parseAsStringLiteral(RECURRING_TRANSACTION_TYPES), ARRAY_DELIMITER),
    frequency: parseAsArrayOf(parseAsStringLiteral(TRANSACTION_FREQUENCIES), ARRAY_DELIMITER),
    importanceLevel: parseAsArrayOf(parseAsStringLiteral(IMPORTANCE_LEVELS), ARRAY_DELIMITER),
    amount: parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),
    nextScheduledDate: parseAsArrayOf(parseAsTimestamp, RANGE_DELIMITER),
    bankAccountId: parseAsString,
    merchantName: parseAsString,
    // REQUIRED FOR SORTING & SELECTION
    sort: parseAsSort,
    uuid: parseAsString,
};

export const searchParamsCache = createSearchParamsCache(searchParamsParser); 