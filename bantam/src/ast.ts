import { TokenType } from "./TokenType"

export interface Expression {
    toString(): string
}

/**
 * A function call like "a(b, c, d)".
 */
export class CallExpression implements Expression {
    constructor(public readonly fun: Expression, public readonly args: Expression[]) { }

    toString() {
        return `${this.fun.toString()}(${this.args.map(e => e.toString()).join(',')})`
    }
}


/**
 * An assignment expression like "a = b".
 */
export class AssignExpression implements Expression {
    constructor(public readonly name: string, public readonly right: Expression) { }


    toString() {
        return `(${this.name} = ${this.right})`
    }
}



/**
 * A ternary conditional expression like "a ? b : c".
 */
export class ConditionalExpression implements Expression {
    constructor(
        public readonly condition: Expression,
        public readonly thenArm: Expression,
        public readonly elseArm: Expression,
    ) { }

    toString(): string {
        return `(${this.condition} ? ${this.thenArm} : ${this.elseArm})`
    }
}


/**
 * A simple variable name expression like "abc".
 */
export class NameExpression implements Expression {
    constructor(public readonly name: string) { }

    toString(): string {
        return this.name
    }
}


/**
 * A binary arithmetic expression like "a + b" or "c ^ d".
 */
export class OperatorExpression implements Expression {
    constructor(
        public readonly left: Expression,
        public readonly operator: TokenType,
        public readonly right: Expression,
    ) { }

    toString(): string {
        return `(${this.left} ${this.operator} ${this.right})`
    }

}


/**
 * A postfix unary arithmetic expression like "a!".
 */
export class PostfixExpression implements Expression {
    constructor(public readonly left: Expression, public readonly operator: TokenType) { }

    toString(): string {
        return `(${this.left}${this.operator})`
    }
}



/**
 * A prefix unary arithmetic expression like "!a" or "-b".
 */
export class PrefixExpression implements Expression {
    constructor(public readonly operator: TokenType, public readonly right: Expression) { }

    toString(): string {
        return `(${this.operator}${this.right})`
    }
}