import { Token } from "./Token"
import { intoTokenType, TokenType } from "./TokenType"

export class Lexer {
    index = 0

    constructor(public readonly text: string) { }

    *[Symbol.iterator](): IterableIterator<Token> {
        while (!this.isEof) {
            let c = this.text[this.index]

            let tType = intoTokenType(c)
            if (tType) {
                yield new Token(tType)
            } else if (isLetter(c)) {
                let start = this.index
                this.index++
                while (!this.isEof) {
                    c = this.text[this.index]
                    if (!(isLetter(c) || isNumber(c))) break;
                    this.index++
                }
                yield new Token(TokenType.NAME, this.text.substring(start, this.index))
                continue
            } else {
                // ingore everything else
            }
            this.index++
        }

        yield new Token(TokenType.EOF)
    }

    get isEof() {
        return this.index >= this.text.length
    }
}

function isLetter(character: string): boolean {
    return /[a-zA-Z-]/.test(character)
}

function isNumber(character: string): boolean {
    return /\d/.test(character)
}