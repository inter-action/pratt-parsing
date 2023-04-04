
## Pratt Parsing

the key point of Pratt Parsing is that:

* it use lookahead to make parsing decision, quite alike with Top Down Parsing
* it use recusive call to handle right associativity & priority



the props about Pratt Parsing is that it handles associativity and left recusive expression parsing with ease without break grammar into higher priority pieces.
and it's relative easy to write by hand.

the most enlightment blog about this technique is the one written by Robert Nystrom. which I personally think it's most natural and easy to understand blog. so I list it in here.

__[Pratt Parsers: Expression Parsing Made Easy](https://journal.stuffwithstuff.com/2011/03/19/pratt-parsers-expression-parsing-made-easy/)__

`./bantam` folder is ported from his `https://github.com/munificent/bantam` repo.

the rust version is come from https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html#Simple-but-Powerful-Pratt-Parsing . 










