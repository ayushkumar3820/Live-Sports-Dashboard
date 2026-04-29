import { MATCHES_SCHEMA } from "../validation/matches";


export const getMatchStatus = (startTime, endTime, now = new Date) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
        return MATCHES_SCHEMA.SCHEDULER;
    } else if (now >= start && now <= end) {
        return MATCHES_SCHEMA.LIVE;
    } else {
        return MATCHES_SCHEMA.FINISHED;
    }
}


export async function syncMatchStatus(match, updateStatus) {
    const newStatus = getMatchStatus(match.startTime, match.endTime);

    // If invalid → do nothing
    if (!newStatus) return;

    // If already same → skip
    if (match.status === newStatus) return;

    // Update DB
    await updateStatus(match.id, newStatus);
}