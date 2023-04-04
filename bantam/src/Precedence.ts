
/**
 * Defines the different precedence levels used by the infix parsers. These
 * determine how a series of infix expressions will be grouped. For example,
 * "a + b * c - d" will be parsed as "(a + (b * c)) - d" because "*" has higher
 * precedence than "+" and "-". Here, bigger numbers mean higher precedence.
 */
export enum Precedence {
  ASSIGNMENT  = 1,
  CONDITIONAL = 2, // we could omit assignment from this line, but anyway
  SUM         = 3,
  PRODUCT     = 4,
  EXPONENT    = 5,
  PREFIX      = 6,
  POSTFIX     = 7,
  CALL        = 8,
}
