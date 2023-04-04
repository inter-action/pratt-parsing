import { Expression } from "./ast";
import { InfixParselet, PrefixParselet } from "./parselets";
import { Token } from "./Token";
import { TokenType } from "./TokenType";

export class ParseException extends Error { }

export class Parser {
    private infixParselets = new Map<TokenType, InfixParselet>()
    private prefixParselets = new Map<TokenType, PrefixParselet>()
    private index = 0

    constructor(private readonly tokens: Token[]){}

    parseExpression(breakPrecedency = 0): Expression {
        let token = this.consume()
        let prefix = this.getPrefixParselet(token.mType)
        if (!prefix) throw new ParseException(`Could not parse token: ${token.mText}, ${token.mType}`)
        let left = prefix.parse(this, token)

        while (true) {
            let next = this.peek()

            if (!next) throw new Error('unexpected end of token array')
            if (next.mType == TokenType.EOF) return left // EOF, only EOF token is the valid terminate signal
            let infix = this.getInfixParselet(next.mType)
            // could be , in function call args, or : in ( <boolean> ? <l> : <r>) expression
            // which we need to terminate here
            if (!infix) return left

            // valid operator exsits, because we assigned proper precedence value & parselet to it
            next = this.consume()
            if (breakPrecedency < infix.precedence) { // at least it would >0, so it must have a parselet
                left = this.getInfixParselet(next.mType)!.parse(this, left, next)
            }
        }
    }

    get EOF() { // reachs the end of array
        return this.index >= this.tokens.length
    }

    peek(index = this.index) {
        if (this.EOF) return null

        return this.tokens[index]
    }

    consume(expected?: TokenType) {
        if (this.EOF) throw new Error('EOF')

        if (expected) {
            let t = this.peek()!
            if (t.mType != expected) {
                throw new ParseException(`${expected} expected, but meet: ${t}`)
            }
            return this.tokens[this.index++]
        } else {
            return this.tokens[this.index++]
        }

    }

    match(expected: TokenType){
        if (this.peek()?.mType == expected) {
            this.consume()
            return true
        }

        return false
    }

    setPrefixParselet(tokenType: TokenType, parselet: PrefixParselet) {
        return this.prefixParselets.set(tokenType, parselet)
    }

    getPrefixParselet(tokenType: TokenType): PrefixParselet | undefined {
        return this.prefixParselets.get(tokenType)
    }

    setInfixParselet(tokenType: TokenType, parselet: InfixParselet) {
        return this.infixParselets.set(tokenType, parselet)
    }

    getInfixParselet(tokenType: TokenType): InfixParselet | undefined {
        return this.infixParselets.get(tokenType)
    }
}


