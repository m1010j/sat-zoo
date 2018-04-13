# Sat Zoo

[Live](http://www.matthiasjenny.com/sat-zoo)

Sat Zoo is a tool to test whether a well-formed formula of Boolean logic is satisfiable, powered by the [boolean-logic](https://github.com/m1010j/boolean-logic) package. Use the keypad or your keyboard to enter to enter a formula above, or randomly generate a formula containing a specified number of atoms.

Well-formed formulas are made up of integers, which are understood as atoms, ⊤ ('true'), ⊥ ('false'), and the connectives ¬ ('not'), ∧ ('and'), ∨ ('or'), ⊻ ('xor'), → ('if . . . then . . .'), ≡ ('if and only if'), and the parentheses.

To use your keyboard to type in a well-formed formula, type 't' for ⊤, 'f' for ⊥, 'N' for ¬, 'A' for ∧, 'O' for ∨, 'X' for ⊻, 'T' for →, and 'B' for ≡.

You can choose one or two algorithms to determine satisfiability. The brute force algorithm generates all possible models for a well-formed formula (i.e. all possible assignments of truth values to the atoms). It then searches through these possible models until it finds one in which the formula is true.

The short truth table method starts by supposing that the well-formed formula is true and assigns all subformulas the truth values that immediately follow. If no further assignment follows, it successively goes through open possibilities. If it ever encounters a contradiction, it backtracks and tries the next possibility, until it either finds a model or else concludes that there is no model.
