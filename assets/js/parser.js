/**
 * Module for parsing Markdown files into structured question objects.
 */
class MarkdownParser {
    /**
     * Parse a markdown string into an array of question objects.
     * @param {string} markdown - The raw markdown text.
     * @returns {Array} An array of question objects.
     */
    parse(markdown) {
        const questions = [];
        // Support carriage return from Windows
        const lines = markdown.split(/\r?\n/);
        let currentQuestion = null;
        let currentSection = '';
        let rawBodyLines = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Detect question header: ## Pregunta X
            const questionMatch = line.match(/^##\s+Pregunta\s+(\d+)/i);
            if (questionMatch) {
                if (currentQuestion) {
                    currentQuestion.body = this._parseBody(rawBodyLines.join('\n'));
                    questions.push(currentQuestion);
                }
                const number = questionMatch[1];
                currentQuestion = {
                    number: parseInt(number, 10),
                    options: [],
                    correct: null,
                    body: []
                };
                rawBodyLines = [];
                currentSection = 'text';
            } 
            // Detect option: a), b), c), d)
            else if (currentQuestion && line.match(/^[a-d]\)/i)) {
                currentSection = 'options';
                this._parseOption(currentQuestion, lines[i]);
            } 
            // Detect content (text or image) inside question
            else if (currentQuestion && currentSection === 'text') {
                // Ignore any major page headers (like # Cuadernillo) and accumulate question text
                if (!line.startsWith('#')) {
                    rawBodyLines.push(lines[i]);
                }
            }
        }

        // Push the last question
        if (currentQuestion) {
            currentQuestion.body = this._parseBody(rawBodyLines.join('\n'));
            questions.push(currentQuestion);
        }

        return questions;
    }

    /**
     * Parses the raw body text of a question into an ordered list of elements (text and images).
     * @param {string} rawBodyText - The raw body lines joined.
     * @returns {Array} List of body elements.
     * @private
     */
    _parseBody(rawBodyText) {
        if (!rawBodyText) return [];
        
        const bodyElements = [];
        // Split by image tags, capturing the tag in the result
        const parts = rawBodyText.split(/(!\[[^\]]*\]\([^)]+\))/g);
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;
            
            const imageMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
            if (imageMatch) {
                bodyElements.push({
                    type: 'image',
                    src: imageMatch[2],
                    alt: imageMatch[1]
                });
            } else {
                // It is text
                const formattedHTML = this._formatText(part);
                if (formattedHTML) {
                    bodyElements.push({
                        type: 'text',
                        content: formattedHTML
                    });
                }
            }
        }
        
        return bodyElements;
    }

    /**
     * Formats raw text segments into paragraph tags with markdown styles.
     * @param {string} text - Raw text chunk.
     * @returns {string} Formatted HTML.
     * @private
     */
    _formatText(text) {
        return text.split(/\n\s*\n/)
            .map(para => {
                const clean = para.trim().replace(/\s+/g, ' ');
                if (!clean) return '';
                return `<p class="question-paragraph">${this._parseInlineMarkdown(clean)}</p>`;
            })
            .filter(Boolean)
            .join('');
    }

    /**
     * Parse a single option line and add it to the current question.
     * @param {Object} question - The current question object.
     * @param {string} line - The option line text.
     * @private
     */
    _parseOption(question, line) {
        const match = line.match(/^([a-d]\))\s*(.*)$/i);
        if (match) {
            const letter = match[1].charAt(0).toLowerCase();
            let text = match[2];
            const isCorrect = text.includes('(correcta)');
            
            // Remove the correct tag and clean whitespace
            text = text.replace(/\s*\(correcta\)\s*/i, '').trim();
            
            // Parse inline markdown styling in the option text
            text = this._parseInlineMarkdown(text);

            question.options.push({
                letter: letter,
                text: text
            });

            if (isCorrect) {
                question.correct = letter;
            }
        }
    }

    /**
     * Replaces simple markdown tags with HTML tags.
     * Supports: **bold**, *italics*, `code`
     * @param {string} text - The input text.
     * @returns {string} The formatted HTML string.
     * @private
     */
    _parseInlineMarkdown(text) {
        if (!text) return '';
        
        let html = text;
        // Escape HTML to prevent XSS
        html = html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Restore basic tags we want to allow, but here we only generate new tags
        // Bold: **text**
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic: *text*
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Inline code: `text`
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');

        return html;
    }
}
