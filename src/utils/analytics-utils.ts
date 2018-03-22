const millisecondsInDay = 86400 * 1000;

function dateRangeToAnalyticsRange(startDate: number, endDate: number) {
    const dayCount = (endDate - startDate) / millisecondsInDay;
    return numberToAnalyticsRange(dayCount);
}

function numberToAnalyticsRange(value: number) {
    if (value < 0) {
        return "< 0";
    } else if (value === 0) {
        return "0";
    } else if (value < 1) {
        return "< 1";
    } else if (value < 10) {
        return "1 - 9";
    } else if (value < 100) {
        return "10 - 99";
    } else if (value < 1000) {
        return "100 - 999";
    } else if (value < 10000) {
        return "1 000 - 9 999";
    } else if (value < 100000) {
        return "10 000 - 99 999";
    } else if (value < 1000000) {
        return "100 000 - 999 999";
    } else if (value < 10000000) {
        return "1 000 000 - 9 999 999";
    }

    return "> 10 000 000";
}

export { dateRangeToAnalyticsRange, numberToAnalyticsRange };
