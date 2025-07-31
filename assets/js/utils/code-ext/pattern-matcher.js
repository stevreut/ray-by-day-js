/**
 * PatternMatcher - Utility for finding code sections by pattern matching
 * Supports string patterns, regex patterns, occurrence counting, and flexible end patterns
 */

export default class PatternMatcher {
    /**
     * Find pattern boundaries in file content
     * @param {string} content - Full file content
     * @param {string|Object} startPattern - Pattern to find start line
     * @param {string|Object|null} endPattern - Pattern to find end line (optional)
     * @returns {Object} {startLine, endLine} (1-indexed line numbers)
     */
    findPatternBoundaries(content, startPattern, endPattern) {
        const lines = content.split('\n');
        
        // Find start line
        const startLine = this.findPatternLine(lines, startPattern, 0);
        if (startLine === -1) {
            throw new Error(`Start pattern not found: ${this.patternToString(startPattern)}`);
        }
        
        // Find end line (if specified)
        let endLine = lines.length; // default to end of file
        if (endPattern && endPattern !== "EOF" && endPattern !== null && endPattern !== "") {
            endLine = this.findPatternLine(lines, endPattern, startLine);
            if (endLine === -1) {
                throw new Error(`End pattern not found: ${this.patternToString(endPattern)}`);
            }
        }
        
        // Validate boundaries
        if (startLine >= endLine) {
            throw new Error(`Invalid pattern boundaries: start (${startLine}) >= end (${endLine})`);
        }
        
        return { startLine: startLine + 1, endLine: endLine + 1 }; // Convert to 1-indexed
    }
    
    /**
     * Find line number for a pattern
     * @param {string[]} lines - Array of file lines
     * @param {string|Object} pattern - Pattern to search for
     * @param {number} startFrom - Line index to start searching from
     * @returns {number} Line index (0-indexed) or -1 if not found
     */
    findPatternLine(lines, pattern, startFrom = 0) {
        if (typeof pattern === 'string') {
            return this.findSimplePattern(lines, pattern, startFrom);
        } else if (pattern && typeof pattern === 'object') {
            return this.findComplexPattern(lines, pattern, startFrom);
        } else {
            throw new Error(`Invalid pattern type: ${typeof pattern}`);
        }
    }
    
    /**
     * Find simple string pattern
     * @param {string[]} lines - Array of file lines
     * @param {string} pattern - String pattern to search for
     * @param {number} startFrom - Line index to start searching from
     * @returns {number} Line index (0-indexed) or -1 if not found
     */
    findSimplePattern(lines, pattern, startFrom = 0) {
        // Check for occurrence specification (e.g., "pattern:2")
        const occurrenceMatch = pattern.match(/^(.+):(\d+)$/);
        if (occurrenceMatch) {
            const actualPattern = occurrenceMatch[1];
            const occurrence = parseInt(occurrenceMatch[2]);
            return this.findOccurrence(lines, actualPattern, occurrence, startFrom);
        }
        
        // Simple first occurrence
        for (let i = startFrom; i < lines.length; i++) {
            if (lines[i].includes(pattern)) {
                return i;
            }
        }
        return -1;
    }
    
    /**
     * Find complex pattern (object specification)
     * @param {string[]} lines - Array of file lines
     * @param {Object} pattern - Pattern object with properties
     * @param {number} startFrom - Line index to start searching from
     * @returns {number} Line index (0-indexed) or -1 if not found
     */
    findComplexPattern(lines, pattern, startFrom = 0) {
        // Handle linesAfter specification
        if (pattern.linesAfter !== undefined) {
            return startFrom + pattern.linesAfter;
        }
        
        // Handle regex pattern
        if (pattern.regex) {
            const regex = new RegExp(pattern.regex);
            const occurrence = pattern.occurrence || 1;
            return this.findRegexOccurrence(lines, regex, occurrence, startFrom);
        }
        
        // Handle string pattern with occurrence
        if (pattern.pattern) {
            const occurrence = pattern.occurrence || 1;
            const caseInsensitive = pattern.caseInsensitive || false;
            return this.findOccurrence(lines, pattern.pattern, occurrence, startFrom, caseInsensitive);
        }
        
        throw new Error(`Invalid pattern object: ${JSON.stringify(pattern)}`);
    }
    
    /**
     * Find specific occurrence of a pattern
     * @param {string[]} lines - Array of file lines
     * @param {string} pattern - String pattern to search for
     * @param {number} occurrence - Which occurrence to find (1-based)
     * @param {number} startFrom - Line index to start searching from
     * @param {boolean} caseInsensitive - Whether to ignore case
     * @returns {number} Line index (0-indexed) or -1 if not found
     */
    findOccurrence(lines, pattern, occurrence, startFrom = 0, caseInsensitive = false) {
        let found = 0;
        const searchPattern = caseInsensitive ? pattern.toLowerCase() : pattern;
        
        for (let i = startFrom; i < lines.length; i++) {
            const line = caseInsensitive ? lines[i].toLowerCase() : lines[i];
            if (line.includes(searchPattern)) {
                found++;
                if (found === occurrence) {
                    return i;
                }
            }
        }
        return -1;
    }
    
    /**
     * Find specific occurrence of a regex pattern
     * @param {string[]} lines - Array of file lines
     * @param {RegExp} regex - Regular expression to search for
     * @param {number} occurrence - Which occurrence to find (1-based)
     * @param {number} startFrom - Line index to start searching from
     * @returns {number} Line index (0-indexed) or -1 if not found
     */
    findRegexOccurrence(lines, regex, occurrence, startFrom = 0) {
        let found = 0;
        
        for (let i = startFrom; i < lines.length; i++) {
            if (regex.test(lines[i])) {
                found++;
                if (found === occurrence) {
                    return i;
                }
            }
        }
        return -1;
    }
    
    /**
     * Convert pattern to string for error messages
     * @param {string|Object} pattern - Pattern to convert
     * @returns {string} String representation
     */
    patternToString(pattern) {
        if (typeof pattern === 'string') {
            return pattern;
        } else if (pattern && typeof pattern === 'object') {
            if (pattern.regex) {
                return `regex: ${pattern.regex}`;
            } else if (pattern.pattern) {
                return `pattern: ${pattern.pattern}${pattern.occurrence ? ` (occurrence: ${pattern.occurrence})` : ''}`;
            } else if (pattern.linesAfter !== undefined) {
                return `linesAfter: ${pattern.linesAfter}`;
            }
        }
        return JSON.stringify(pattern);
    }
} 