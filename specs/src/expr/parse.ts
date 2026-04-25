import ts from 'typescript'

// Cache parsed ASTs across calls — specs commonly repeat expressions
// (e.g. "haveCatTower" used in conditional, when, requiredWhen). Lifetime
// is one CLI run, so unbounded growth is fine.
const cache = new Map<string, ts.Expression | null>()

export function parseExpression (source: string): ts.Expression | null {
  const hit = cache.get(source)
  if (hit !== undefined) return hit
  const sf = ts.createSourceFile('expr.ts', `(${source});`, ts.ScriptTarget.Latest, true)
  const stmt = sf.statements[0]
  if (!stmt || !ts.isExpressionStatement(stmt)) {
    cache.set(source, null)
    return null
  }
  let expr: ts.Expression = stmt.expression
  if (ts.isParenthesizedExpression(expr)) expr = expr.expression
  cache.set(source, expr)
  return expr
}

export interface IdentRoot {
  /** The first identifier in an a.b.c chain, or the bare identifier itself. */
  root: string
  /** Property access segments after the root, in order. */
  chain: string[]
  /** The AST node where this root was found. */
  node: ts.Node
}

// Chain interiors are not reported — `a.b.c` arrives as a single
// IdentRoot { root: 'a', chain: ['b', 'c'] }.
export function walkIdents (root: ts.Node, visit: (i: IdentRoot) => void): void {
  const go = (node: ts.Node): void => {
    if (ts.isPropertyAccessExpression(node)) {
      const parent = node.parent
      const insideChain = parent && ts.isPropertyAccessExpression(parent) && parent.expression === node
      if (insideChain) return                                                // outer top will handle this subtree
      const path = unwrapPropertyAccess(node)
      if (path) {
        visit({ root: path.root, chain: path.chain, node })
        return
      }
      // Complex chain (e.g. `f().a`) — recurse normally.
    } else if (ts.isIdentifier(node)) {
      const parent = node.parent
      // Skip the `.name` part of a property access.
      if (parent && ts.isPropertyAccessExpression(parent) && parent.name === node) return
      // Skip the root of a chain — handled when we visit the chain top.
      if (parent && ts.isPropertyAccessExpression(parent) && parent.expression === node) return
      visit({ root: node.text, chain: [], node })
      return
    }
    ts.forEachChild(node, go)
  }
  go(root)
}

function unwrapPropertyAccess (expr: ts.Expression): { root: string, chain: string[] } | null {
  const chain: string[] = []
  let cur: ts.Expression = expr
  while (ts.isPropertyAccessExpression(cur)) {
    chain.unshift(cur.name.text)
    cur = cur.expression
  }
  if (!ts.isIdentifier(cur)) return null
  return { root: cur.text, chain }
}
