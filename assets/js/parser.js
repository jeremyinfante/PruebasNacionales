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

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (!line) continue;

            // Detect question header: ## Pregunta X
            const questionMatch = line.match(/^##\s+Pregunta\s+(\d+)/i);
            if (questionMatch) {
                if (currentQuestion) {
                    // Post-process accumulated text for inline styles
                    currentQuestion.text = this._parseInlineMarkdown(currentQuestion.text.trim());
                    questions.push(currentQuestion);
                }
                const number = questionMatch[1];
                currentQuestion = {
                    number: parseInt(number, 10),
                    text: '',
                    images: [],
                    options: [],
                    correct: null
                };
                currentSection = 'text';
            } 
            // Detect option: a), b), c), d)
            else if (currentQuestion && line.match(/^[a-d]\)/i)) {
                currentSection = 'options';
                this._parseOption(currentQuestion, line);
            } 
            // Detect content (text or image) inside question
            else if (currentQuestion && currentSection === 'text') {
                // Detect markdown image tag: ![alt](url)
                const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
                if (imageMatch) {
                    currentQuestion.images.push(imageMatch[2]);
                } 
                // Ignore any major page headers (like # Cuadernillo) and accumulate question text
                else if (!line.startsWith('#')) {
                    if (currentQuestion.text) {
                        currentQuestion.text += ' ' + line;
                    } else {
                        currentQuestion.text = line;
                    }
                }
            }
        }

        // Push the last question
        if (currentQuestion) {
            currentQuestion.text = this._parseInlineMarkdown(currentQuestion.text.trim());
            questions.push(currentQuestion);
        }

        return questions;
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
