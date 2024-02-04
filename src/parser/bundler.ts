
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

  produceLines(obj: {[key:string]: any}): string[] {
    return Object.entries(obj).map(([k, v]) => {
      let value = ''

      switch (v.type) {
        case ValueType.Text:
          value = `"${v.value}"`
          break
        case ValueType.Asset:
          value = `"${v.value}"`
          break
        default:
          value = v.value
          break
      }

      return `  --${k.replaceAll('.', '-')}: ${value};`
    })
  }

}
