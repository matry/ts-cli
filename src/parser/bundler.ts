
export class Bundler {
  private renderTree: any
  public output: string

  constructor(renderTree: any) {
    this.renderTree = renderTree
    this.output = ''
  }

  bundle() {
    const firstLine = ':root {'
    const lines = this.produceLines(this.renderTree)

    this.output = [
      firstLine,
      ...lines,
      '}'
    ].join('\n')
  }

  produceLines(obj: {[key:string]:string|number}): string[] {
    return Object.entries(obj).map(([k, v]) => `  --${k.replaceAll('.', '-')}: ${v};`)
  }

}
