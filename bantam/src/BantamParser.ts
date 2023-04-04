import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { Precedence } from "./Precedence";
import { TokenType } from "./TokenType";
import { CallParselet } from "./parselets";
import {
    AssignParselet,
    BinaryOperatorParselet,
    ConditionalParselet,
    GroupParselet,
    NameParselet,
    PostfixOperatorParselet,
    PrefixOperatorParselet,
} from "./parselets";

/**
 * Extends the generic Parser class with support for parsing the actual Bantam
 * grammar.
 */
export class BantamParser extends Parser {
    constructor(lexer: Lexer) {
        super([...lexer]);

        // Register all of the parselets for the grammar.

        // Register the ones that need special parselets.
        this.setPrefixParselet(TokenType.NAME, new NameParselet());
        this.setInfixParselet(TokenType.ASSIGN, new AssignParselet());
        this.setInfixParselet(TokenType.QUESTION, new ConditionalParselet());
        // note! the same token type `(`, but for different Parselet
        //
        // image how the parsing steps could excuete for :
        //      a * (b + c)
        //          ^ this could only happen in prefix parsing phase
        //      sum(b, c)
        //         ^ this could only happen in infix parsing phase
        //
        this.setPrefixParselet(TokenType.LEFT_PAREN, new GroupParselet());
        this.setInfixParselet(TokenType.LEFT_PAREN, new CallParselet());

        // Register the simple operator parselets.
        this.prefix(TokenType.PLUS, Precedence.PREFIX);
        this.prefix(TokenType.MINUS, Precedence.PREFIX);
        this.prefix(TokenType.TILDE, Precedence.PREFIX);

        this.prefix(TokenType.BANG, Precedence.PREFIX);
        // For kicks, we'll make "!" both prefix and postfix, kind of like ++.
        this.postfix(TokenType.BANG, Precedence.POSTFIX);

        this.infixLeft(TokenType.PLUS, Precedence.SUM);
        this.infixLeft(TokenType.MINUS, Precedence.SUM);
        this.infixLeft(TokenType.ASTERISK, Precedence.PRODUCT);
        this.infixLeft(TokenType.SLASH, Precedence.PRODUCT);
        this.infixRight(TokenType.CARET, Precedence.EXPONENT);
    }

    /**
     * Registers a postfix unary operator parselet for the given token and
     * precedence.
     */
    postfix(tokenType: TokenType, precedence: number) {
        this.setInfixParselet(tokenType, new PostfixOperatorParselet(precedence));
    }

    /**
     * Registers a prefix unary operator parselet for the given token and
     * precedence.
     */
    prefix(tokenType: TokenType, precedence: number) {
        this.setPrefixParselet(tokenType, new PrefixOperatorParselet(precedence));
    }

    /**
     * Registers a left-associative binary operator parselet for the given token
     * and precedence.
     */
    infixLeft(tokenType: TokenType, precedence: number) {
        this.setInfixParselet(tokenType, new BinaryOperatorParselet(precedence, false));
    }

    /**
     * Registers a right-associative binary operator parselet for the given token
     * and precedence.
     */
    infixRight(tokenType: TokenType, precedence: number) {
        this.setInfixParselet(tokenType, new BinaryOperatorParselet(precedence, true));
    }
}
