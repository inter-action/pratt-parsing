
import { assert } from 'chai'
import { Lexer } from '../src/Lexer';
import { BantamParser } from '../src/BantamParser';

describe('BantamParser', () => { // the tests container
    it('the basic case should work', () => {
        let input = 'a + b * c - d'
        let lexer = new Lexer(input)
        let parser = new BantamParser(lexer)
        let expression = parser.parseExpression()
        console.log(expression)
    });


    it('nested arity expression', () => {
        let input = 'a ? b : c ? d : f'
        let lexer = new Lexer(input)
        let parser = new BantamParser(lexer)
        let expression = parser.parseExpression()
        console.log(expression)
    });

    it('nested expression with function call', () => {
        let input = 'sum(a + b, !c)'
        let lexer = new Lexer(input)
        let parser = new BantamParser(lexer)
        let expression = parser.parseExpression()
        console.log(expression)
    });
});
