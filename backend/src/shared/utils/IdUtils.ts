import { Types } from "mongoose";

/**
 * Interface for objects that might have an id property
 */
interface ObjectWithId {
    id?: string | number | { toString(): string };
    _id?: string | number | { toString(): string } | Types.ObjectId;
    [key: string]: unknown;
}

/**
 * Safely converts various ID formats to a string representation.
 * Handles:
 * - string
 * - number
 * - Mongoose ObjectId
 * - Objects with .id or ._id properties
 * - Objects with .toString() method
 * 
 * @param id - The ID value to convert
 * @returns The string representation of the ID, or an empty string if invalid
 */
export function safelyConvertIdToString(id: unknown): string {
    if (id === null || id === undefined) {
        return "";
    }

    if (typeof id === "string") {
        return id;
    }

    if (typeof id === "number") {
        return id.toString();
    }

    if (id instanceof Types.ObjectId) {
        return id.toString();
    }

    // Check for objects with .toString() that returns a valid ID
    // This covers Mongoose ObjectIds passed as generic objects
    if (typeof id === "object" && "toString" in id && typeof (id as { toString: Function }).toString === "function") {
        const str = (id as { toString: () => string }).toString();
        // A simple heuristic: if it looks like an ObjectId (24 hex chars), it's probably what we want
        // But even if not, toString() is usually the best bet for direct object conversion
        if (str !== "[object Object]") {
            return str;
        }
    }

    // Check for .id or ._id properties
    const obj = id as ObjectWithId;

    if (obj._id) {
        return safelyConvertIdToString(obj._id);
    }

    if (obj.id) {
        return safelyConvertIdToString(obj.id);
    }

    return "";
}
