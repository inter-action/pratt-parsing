
say I have a function that has a type of `F: (tokens: Token[], left: Expression | null)-> Expression`, and I wanna parse this `a + b * c - d` expression into this S-Expression `(-(+ a (* b c)) d)`


```
a + b * c - d
^ for any terminal token, which is a,b,c,d in this case, F(a, ..) would return a, so I'll left it out in the following example


a + b * c - d
  ^ sees +, infix operator, would call
    // return (a, F(remaning, a))
    //            ^- this would internally spawn 
    //              return AddExpression(a, F(remaining, a))
       ^ then sees * which also is infix operator, it would call 
    //                      return MultiExpression(b, F(remaning, b))
    //                             ^ when it peeked `-`, it would return MultiExpression(b, c), rewind the callstack to outmost parsing for a token
    //                               it would rewind, because - has less precedence then *
    //      ^ then in the outer most expression a would become AddExpression(a, MultiExpression(b, c))
    //        then it'll continue to peek next token, which is -, then it would call F(reminaing, a)
    //        which is:
    //              return F(remaning, AddExpression(a, MultiExpression(b, c)))
    //                     return MinusExpression(AddExpression(a, MultiExpression(b, c)), d)
```


as u can see, that is the core concept of patt parsing, it consist the following part
* peek action to see next token, then from there decide where to go next
* a recursive F, that take already parsed expression and remaning token,  which internally would loop & recursively call itself.
* a set of parsing rule, to parse infix or prefix or even postfix, and know how to combine each parsed AST nodes.