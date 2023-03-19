
use std::{fmt, io::BufRead};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Token {
    Atom(char),
    Op(char),
    Eof,
}

struct Lexer {
    tokens: Vec<Token>,
}


impl Lexer {
    fn new(input: &str)-> Lexer {
        let mut tokens = input
            .chars()
            .filter(|it| !it.is_ascii_whitespace())
            .map(|it| match it {
                '0'..='9' | 'a'..='z' | 'A'..='Z' => Token::Atom(it),
                _ => Token::Op(it),
            })
            .collect::<Vec<_>>();
        tokens.reverse();
        Lexer {tokens}
    }

    fn next(&mut self)-> Token {
        self.tokens.pop().unwrap_or(Token::Eof)
    }

    fn peek(&mut self) -> Token {
        self.tokens.last().copied().unwrap_or(Token::Eof)
    }
}

enum S {
    Atom(char),
    Cons(char, Vec<S>)
}

impl fmt::Display for S {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            S::Atom(i) => write!(f, "{}", i),
            S::Cons(head, rest)=> {
                write!(f, "({}", head)?;
                for s in rest {
                    write!(f, " {}", s)?;
                }
                write!(f, ")")
            }
        }
    }
}

fn expr(input: &str) -> S {
    let mut lexer = Lexer::new(input);
    expr_bp(&mut lexer, 0)
}

fn expr_bp(lexer: &mut Lexer, min_bp: u8) -> S {
    let mut lhs = match lexer.next() {
        Token::Atom(it)=> S::Atom(it),
        Token::Op('(') => {
            let lhs = expr_bp(lexer, 0);
            assert_eq!(lexer.next(), Token::Op(')'));
            lhs
        },
        Token::Op(op)=> {
            let ((), r_bp) = prefix_binding_power(op);
            let rhs = expr_bp(lexer, r_bp);
            S::Cons(op, vec![rhs])
        },
        t=> panic!("bad token: {:?}", t),
    };

    loop {
        let op = match lexer.peek(){
            Token::Eof=> break,
            Token::Op(op)=> op,
            t=> panic!("bad token: {:?}", t),
        };


        if let Some((l_bp, ()))  = postfix_binding_power(op) {
            if l_bp < min_bp {
            //        ^ min_bp, is previous r_bp, for example:
            // 3  +  4  *  5
            //   5  6  7  8
            //         ^ 7, is l_bp for *
            //      ^ 6, is the min_bp, the previous r_bp for +
            //  if l_bp >= min_bp (previous r_bp), then it would goes to recurisve call which
            //  handle right associativity
                break;
            }
            lexer.next();

            lhs = if op == '[' {
                let rhs = expr_bp(lexer, 0);
                //                       ^ same as parsing (), for any grouping, this is new start
                assert_eq!(lexer.next(), Token::Op(']'));
                S::Cons(op, vec![lhs, rhs])     
            } else {
                S::Cons(op, vec![lhs])
            };
            continue; // continue parsing for any sub items whose operator bp(binding power) is
                      // less than r_bp
        }

        if let Some((l_bp, r_bp)) = infix_binding_power(op) {
            if l_bp < min_bp {
                break;
            }

            lexer.next();
            lhs = if op == '?' {
                let mhs = expr_bp(lexer, 0);
                assert_eq!(lexer.next(), Token::Op(':'));
                let rhs = expr_bp(lexer, r_bp);
                S::Cons(op, vec![lhs, mhs, rhs])
            } else {
                let rhs = expr_bp(lexer, r_bp);
                S::Cons(op, vec![lhs, rhs])
            };
            continue;
        }

        break; // break on group ending operator, which includes ) ]
    }

    lhs
}

fn prefix_binding_power(op: char) -> ((), u8) {
    match op {
        '+' | '-' => ((), 9),
        _ => panic!("bad op: {:?}", op)
    }
}

fn postfix_binding_power(op: char)-> Option<(u8, ())> {
    let res = match op {
       '!' => (11, ()),
       '[' => (11, ()),
       _ => return None
    };

    Some(res)
}


fn infix_binding_power(op: char) -> Option<(u8, u8)> {
    let res = match op {
       '=' => (2, 1),
       '?' => (4, 3),
       //      ^ for any operator, if left bind power is greater than right operator, then its
       //      associativity is right 
       '+' | '-' => (5, 6),
       '*' | '/' => (7, 8),
       '.' => (14, 13),
       _ => return None
    };

    Some(res)
}


#[test]
fn tests() {
    let s = expr("1");
    assert_eq!(s.to_string(), "1");
    let s = expr("1 + 2 * 3");
    assert_eq!(s.to_string(), "(+ 1 (* 2 3))");
    let s = expr("a + b * c * d + e");
    assert_eq!(s.to_string(), "(+ (+ a (* (* b c) d)) e)");
    let s = expr("f . g . h");
    assert_eq!(s.to_string(), "(. f (. g h))");
    let s = expr(" 1 + 2 + f . g . h * 3 * 4");
    assert_eq!(
        s.to_string(),
        "(+ (+ 1 2) (* (* (. f (. g h)) 3) 4))",
    );
    let s = expr("--1 * 2");
    assert_eq!(s.to_string(), "(* (- (- 1)) 2)");
    let s = expr("--f . g");
    assert_eq!(s.to_string(), "(- (- (. f g)))");
    let s = expr("-9!");
    assert_eq!(s.to_string(), "(- (! 9))");
    let s = expr("f . g !");
    assert_eq!(s.to_string(), "(! (. f g))");
    let s = expr("(((0)))");
    assert_eq!(s.to_string(), "0");
    let s = expr("x[0][1]");
    assert_eq!(s.to_string(), "([ ([ x 0) 1)");
    let s = expr(
        "a ? b :
         c ? d
         : e",
    );
    assert_eq!(s.to_string(), "(? a b (? c d e))");
    let s = expr("a = 0 ? b : c = d");
    assert_eq!(s.to_string(), "(= a (= (? 0 b c) d))")
}

fn main() {
    for line in std::io::stdin().lock().lines() {
        let line = line.unwrap();
        let s = expr(&line);
        println!("{}", s)
    }
}

