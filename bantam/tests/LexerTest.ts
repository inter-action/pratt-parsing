import { assert } from 'chai'
import { Lexer } from '../src/Lexer';

describe('Lexer', () => { // the tests container
    it('basic case', () => {
        let input = 'a + b * c - d'
        let lexer = new Lexer(input)
        let result = [...lexer]
        console.log(result)
    });
});