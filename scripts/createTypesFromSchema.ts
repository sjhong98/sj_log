import * as tables from '../supabase/schema'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

let imports = 'import {InferSelectModel} from "drizzle-orm";'
let tableNames: string[] = []
let exports = ''

console.log('\n\nCreating Types from Schema...')

for (const [name, tbl] of Object.entries(tables)) {
  console.log('Table name: ', name)
  tableNames.push(name)
  exports += `export type ${name}Type = Omit<InferSelectModel<typeof ${name}>, 'pk' | 'createdAt' | 'updatedAt' | 'uid'> & { pk?: number; created_at?: Date; updated_at?: Date }\n`
}

const content = `${imports}\n\nimport { ${tableNames.join(',')} } from '../supabase/schema'\n\n${exports}`

const outputPath = resolve(__dirname, '../types/schemaType.ts')

writeFileSync(outputPath, content, { encoding: 'utf-8' })
