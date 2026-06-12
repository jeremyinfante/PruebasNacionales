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
        if (!text) return '';
        
        const lines = text.split(/\r?\n/);
        let html = '';
        let listType = null; // 'ul', 'ol', or null
        let paragraphBuffer = [];
        
        const flushParagraph = () => {
            if (paragraphBuffer.length > 0) {
                const content = paragraphBuffer.map(line => this._parseInlineMarkdown(line)).join('<br>');
                html += `<p class="question-paragraph">${content}</p>`;
                paragraphBuffer = [];
            }
        };
        
        for (let i = 0; i < lines.length; i++) {
            const rawLine = lines[i];
            const trimmedLine = rawLine.trim();
            
            if (trimmedLine === '') {
                flushParagraph();
                if (listType) {
                    html += `</${listType}>`;
                    listType = null;
                }
                continue;
            }
            
            // Check for list items
            const ulMatch = trimmedLine.match(/^[-*]\s+(.*)$/);
            const olMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
            
            if (ulMatch) {
                flushParagraph();
                if (listType !== 'ul') {
                    if (listType) {
                        html += `</${listType}>`;
                    }
                    html += '<ul class="question-list">';
                    listType = 'ul';
                }
                const content = this._parseInlineMarkdown(ulMatch[1].trim());
                html += `<li class="question-list-item">${content}</li>`;
            } else if (olMatch) {
                flushParagraph();
                if (listType !== 'ol') {
                    if (listType) {
                        html += `</${listType}>`;
                    }
                    html += '<ol class="question-list">';
                    listType = 'ol';
                }
                const content = this._parseInlineMarkdown(olMatch[2].trim());
                html += `<li class="question-list-item">${content}</li>`;
            } else {
                if (listType) {
                    html += `</${listType}>`;
                    listType = null;
                }
                paragraphBuffer.push(trimmedLine);
            }
        }
        
        flushParagraph();
        if (listType) {
            html += `</${listType}>`;
        }
        
        return html;
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
