import prettier from 'prettier'

const TS_OPTIONS: prettier.Options = {
  parser: 'typescript',
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  printWidth: 100,
  arrowParens: 'avoid'
}

export async function formatTS (source: string): Promise<string> {
  return prettier.format(source, TS_OPTIONS)
}
