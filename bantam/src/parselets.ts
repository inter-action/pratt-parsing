import { ParseException, Parser } from "./Parser";
import { AssignExpression, CallExpression, ConditionalExpression, Expression, NameExpression } from "./ast"
import { Token } from "./Token";
import { Precedence } from "./Precedence";
import { OperatorExpression } from "./ast";
import { TokenType } from "./TokenType";
import { PostfixExpression } from "./ast";
import { PrefixExpression } from "./ast";

/**
 * One of the two parselet interfaces used by the Pratt parser. An
 * InfixParselet is associated with a token that appears in the middle of the
 * expression it parses. Its parse() method will be called after the left-hand
 * side has been parsed, and it in turn is responsible for parsing everything
 * that comes after the token. This is also used for postfix expressions, in
 * which case it simply doesn't consume any more tokens in its parse() call.
 */
export interface InfixParselet {
    parse(parser: Parser, left: Expression, token: Token): Expression;
    get precedence(): number;
}


/**
 * Parses assignment expressions like "a = b". The left side of an assignment
 * expression must be a simple name like "a", and expressions are
 * right-associative. (In other words, "a = b = c" is parsed as "a = (b = c)").
 */
export class AssignParselet implements InfixParselet {
    parse(parser: Parser, left: Expression, token: Token): Expression {
        let right = parser.parseExpression(this.precedence - 1)
        //                                 ^ so for example a = b = c
        //                                                 0  1  
        //                                                    ^ when see first =
        //                                                    0   1
        //                                                        ^ when see second =
        // but in the parser, why not using >=, so make it default to right associate
        // aha, I got it, if we using >=, say if we wanna make it left associate, we have to 
        // call this.parseExpression(this.precedence - 1), and default is 0, that would cause
        // some parsing issue/edge cases when handle group operator like `{} ()`, since we wanna
        // assign them to 0 when calling parser.parseException() method
        //

        // if (!right) {
        //     throw new ParseException("right assignment is expected")
        // }
        // this check would be handled in parser, so this part is guaranteed not be null

        if (left instanceof NameExpression) {
            return new AssignExpression(left.name, right)
        } else {
            throw new ParseException("NameExpression is expected")
        }
    }
    get precedence(): number {
        return Precedence.ASSIGNMENT
    }
}


/**
 * Generic infix parselet for a binary arithmetic operator. The only
 * difference when parsing, "+", "-", "*", "/", and "^" is precedence and
 * associativity, so we can use a single parselet class for all of those.
 */
export class BinaryOperatorParselet implements InfixParselet {
    constructor(public readonly prec: number, public readonly isRightAssoc: boolean){}

    parse(parser: Parser, left: Expression, token: Token): Expression {
        // To handle right-associative operators like "^", we allow a slightly
        // lower precedence when parsing the right-hand side. This will let a
        // parselet with the same precedence appear on the right, which will then
        // take *this* parselet's result as its left-hand argument.
        let right = parser.parseExpression(this.isRightAssoc ? this.precedence - 1 : this.precedence)
        return new OperatorExpression(left, token.mType, right)
    }

    get precedence(): number {
        return this.prec
    }
}

/**
 * Parselet to parse a function call like "a(b, c, d)".
 */
export class CallParselet implements InfixParselet {
    parse(parser: Parser, left: Expression, token: Token): Expression {
        let args: Expression[] = []

        if (!parser.match(TokenType.RIGHT_PAREN)) { // if statement with side effect, I don't like the taste
            do {
                args.push(parser.parseExpression(0))
            } while (parser.match(TokenType.COMMA))
            parser.consume(TokenType.RIGHT_PAREN) // throw if not match
        }

        return new CallExpression(left, args)
    }

    get precedence(): number {
        return Precedence.CALL
    }
}


/**
 * Parselet for the condition or "ternary" operator, like "a ? b : c".
 */
export class ConditionalParselet implements InfixParselet {
    parse(parser: Parser, left: Expression, token: Token): Expression {
        let thenArm = parser.parseExpression()
        parser.consume(TokenType.COLON)
        // a ? b : c
        //       ^ this has the lowest precedence, so all expression would be be terminated in here. 
        //       that's the reason we don't need to pass a precedence value to parser.parseExpression function call
        //          x ? y : z
        //            ^ -- we need put this into deeper parse tree, so it's right associated
        let elseArm = parser.parseExpression(this.precedence - 1)

        return new ConditionalExpression(left, thenArm, elseArm)
    }
    get precedence(): number {
        return Precedence.CONDITIONAL
    }
}



/**
 * Generic infix parselet for an unary arithmetic operator. Parses postfix
 * unary "?" expressions.
 */
export class PostfixOperatorParselet implements InfixParselet {
    constructor(public readonly prec: number) {}

    parse(parser: Parser, left: Expression, token: Token): Expression {
        return new PostfixExpression(left, token.mType)
    }

    get precedence(): number {
        return this.prec
    }

}

/**
 * One of the two interfaces used by the Pratt parser. A PrefixParselet is
 * associated with a token that appears at the beginning of an expression. Its
 * parse() method will be called with the consumed leading token, and the
 * parselet is responsible for parsing anything that comes after that token.
 * This interface is also used for single-token expressions like variables, in
 * which case parse() simply doesn't consume any more tokens.
 * @author rnystrom
 *
 */
export interface PrefixParselet {
    parse(parser: Parser, token: Token): Expression
}


/**
 * Parses parentheses used to group an expression, like "a * (b + c)".
 */
export class GroupParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expression {
        let expr = parser.parseExpression()
        parser.consume(TokenType.RIGHT_PAREN)
        return expr
    }
}



/**
 * Simple parselet for a named variable like "abc".
 */
export class NameParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expression {
        return new NameExpression(token.mText!)
    }
}

/**
 * Generic prefix parselet for an unary arithmetic operator. Parses prefix
 * unary "-", "+", "~", and "!" expressions.
 */
export class PrefixOperatorParselet implements PrefixParselet {
    constructor(public readonly prec: number) {}

    parse(parser: Parser, token: Token): Expression {
        // To handle right-associative operators like "^", we allow a slightly
        // lower precedence when parsing the right-hand side. This will let a
        // parselet with the same precedence appear on the right, which will then
        // take *this* parselet's result as its left-hand argument.
        let right = parser.parseExpression(this.prec)
        //                                 ^
        // for precedence lower than Precedence.PREFIX:
        // so for example !2 + 3 would be (+ (! 2) 3)
        //
        // for precedence greater than Precedence.PREFIX:
        // but for POSTFIX & CALL, !a? would be (? (! a))
        // !sum(1, 3), would be (! (:call sum 1 3))
        return new PrefixExpression(token.mType, right)
    }
}

