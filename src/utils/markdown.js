/**
 * Extremely simple markdown to HTML converter for basic formatting.
 * Supports:
 * - **bold**
 * - *italic*
 * - - Bullet points
 * - New lines (converted to <br /> or paragraphs)
 */
export const markdownToSafeHTML = (text) => {
    if (!text) return '';

    // Escape basic HTML to prevent XSS (though this is a simplified version)
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic: *text* -> <em>text</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Bullet points: - text -> <li style="margin-left: 20px; list-style-type: disc;">text</li>
    // We'll wrap sequences of list items in a div later if needed, but for now simple <li>
    html = html.replace(/^- (.*)$/gm, '<li style="margin-left: 20px; list-style-type: disc; margin-bottom: 8px;">$1</li>');

    // Convert remaining newlines to breaks, but handle double newlines as paragraph breaks
    html = html.replace(/\n\n/g, '<div style="margin-bottom: 16px;"></div>');
    html = html.replace(/\n/g, '<br />');

    return html;
};
