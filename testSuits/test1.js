const STR = `(define a (+ 10 (* 4 5) 3 5 (* 3 4 (+ 6 7 9))))(define b (+ 12 a))
(define k (* 30 (+ 8 9) 6))
(define square (lambda (x) (* x x)))
(define add20 (lambda (x y z) (+ x (+ y (+ z 20)))))
(print 10)
(print (+ 10 (* 4 5) 3 5 (* 3 4 (+ 6 7 9))))
(print k)
(print (square 20))
(print (square a))
(print (add20 20 a b))
(print (add20 1 (square 10) 3))
(print (min 9 10))
(print (/ 100 a))
(print (>= 10 a))
(if (== 13 13) 50 10)
(define t (+ 3 4 (+ 4 5 (* 3 5))))
(print ((lambda (x) (* x x)) 10))
(print ((lambda (x y) (+ 3 x y)) 10 20))
(define l (list 3 a 1))
(print (car l))
(print (cdr l))
(print (cons 55 l))
(print (isList l))
(define i "aish")`;

module.exports = STR;
