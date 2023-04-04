export enum TokenType {
    LEFT_PAREN = '(',
    RIGHT_PAREN = ')',
    COMMA = ',',
    ASSIGN = '=',
    PLUS = '+',
    MINUS = '-',
    ASTERISK = '*',
    SLASH = '/',
    CARET = '^',
    TILDE = '~',
    BANG = '!',
    QUESTION = '?',
    COLON = ':',
    NAME = 'NAME',
    EOF = 'EOF'
}


/**
* If the TokenType represents a punctuator (i.e. a token that can split an
* identifier like '+', this will get its text.
*/
export function punctuator(tokenType: TokenType): string | null {
    switch (tokenType) {
        case TokenType.LEFT_PAREN: return '('
        case TokenType.RIGHT_PAREN: return ')'
        case TokenType.COMMA: return ','
        case TokenType.ASSIGN: return '='
        case TokenType.PLUS: return '+'
        case TokenType.MINUS: return '-'
        case TokenType.ASTERISK: return '*'
        case TokenType.SLASH: return '/'
        case TokenType.CARET: return '^'
        case TokenType.TILDE: return '~'
        case TokenType.BANG: return '!'
        case TokenType.QUESTION: return '?'
        case TokenType.COLON: return ':'
        // case NAME: return '('
        // NAME is not a punctuator
        default: return null
    }
}

export function intoTokenType(character: string): TokenType | null {
    switch (character) {
        case '(': return TokenType.LEFT_PAREN
        case ')': return TokenType.RIGHT_PAREN
        case ',': return TokenType.COMMA
        case '=': return TokenType.ASSIGN
        case '+': return TokenType.PLUS
        case '-': return TokenType.MINUS
        case '*': return TokenType.ASTERISK
        case '/': return TokenType.SLASH
        case '^': return TokenType.CARET
        case '~': return TokenType.TILDE
        case '!': return TokenType.BANG
        case '?': return TokenType.QUESTION
        case ':': return TokenType.COLON
        // case NAME: return '('
        // NAME is not a punctuator
        default: return null
    }
}