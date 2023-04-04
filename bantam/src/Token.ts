import { TokenType } from "./TokenType";

export class Token {
    constructor(public readonly mType: TokenType, public readonly mText?: string){}

    toString(){
        return `Token{ type: ${this.mType}, text: ${this.mText} }`
    }
}
