

this code is rip from matklad's blog - https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html#Simple-but-Powerful-Pratt-Parsing


which I find the approach described by the author is quite hard to comprehence and more counterintuitive for my own taste.

the good part of this approach is that it defines a concept `binding power` which is more natual to handle left associativity. for example 

```plain
op, left binding power, right binding power

+, 3, 4 // if l_bp < r_bp then is left associative, otherwise it's right associative

```



run & test

```
cargo run
cargo test
```