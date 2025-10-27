/**
 * Formats a date string to a localized format
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param options - Intl.DateTimeFormatOptions for customizing the output
 * @returns Formatted date string
 */
export const formatDate = (
    dateString: string, 
    locale: string = 'en-US',
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }
): string => {
    return new Date(dateString).toLocaleDateString(locale, options);
};

/**
 * Formats a date string to a short format (no time)
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted date string without time
 */
export const formatDateShort = (
    dateString: string, 
    locale: string = 'en-US'
): string => {
    return formatDate(dateString, locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Formats a date string to include only time
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted time string
 */
export const formatTime = (
    dateString: string, 
    locale: string = 'en-US'
): string => {
    return formatDate(dateString, locale, {
        hour: '2-digit',
        minute: '2-digit'
    });
};