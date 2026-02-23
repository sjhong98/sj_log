/**
 * PostgREST 쿼리 파라미터 빌더 (ORM 스타일)
 * select, eq, neq, gt, gte, lt, lte, like, ilike, is, in, not, or, orderBy, limit, offset 지원
 */

type FilterOp =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'is'
  | 'in'
  | 'not'

type OrderDir = 'asc' | 'desc'

interface OrCondition {
  column: string
  op: FilterOp
  value: string | number | boolean | null
}

interface OrderSpec {
  column: string
  dir: OrderDir
}

function formatValue(v: string | number | boolean | null): string {
  if (v === null) return 'null'
  if (v === true) return 'true'
  if (v === false) return 'false'
  if (typeof v === 'number') return String(v)
  return String(v)
}

function encodeFilterValue(v: string | number | boolean | null): string {
  const s = formatValue(v)
  return encodeURIComponent(s)
}

export function postgrestQuery(): any {
  let selectColumns: string = '*'
  const filters: Array<{ column: string; op: FilterOp; value: string | number | boolean | null }> = []
  let orConditions: OrCondition[] = []
  const orderSpecs: OrderSpec[] = []
  let limitValue: number | null = null
  let offsetValue: number | null = null

  return {
    /** 조회할 컬럼. 문자열 여러 개 또는 '*' */
    select(...columns: string[]): ReturnType<typeof postgrestQuery> {
      selectColumns = columns.length === 0 ? '*' : columns.join(',')
      return this as ReturnType<typeof postgrestQuery>
    },

    /** 같음 (column = value) */
    eq(column: string, value: string | number | boolean | null): ReturnType<typeof postgrestQuery> {
      filters.push({ column, op: 'eq', value })
      return this as ReturnType<typeof postgrestQuery>
    },

    /** 다름 (column <> value) */
    neq(column: string, value: string | number | boolean | null): ReturnType<typeof postgrestQuery> {
      filters.push({ column, op: 'neq', value })
      return this as ReturnType<typeof postgrestQuery>
    },

    /** 큼 (column > value) */
    gt(column: string, value: string | number | boolean | null): ReturnType<typeof postgrestQuery> {
      filters.push({ column, op: 'gt', value })
      return this as ReturnType<typeof postgrestQuery>
    },

    /** 이상 (column >= value) */
    gte(column: string, value: string | number | boolean | null): ReturnType<typeof postgrestQuery> {
      filters.push({ column, op: 'gte', value })
      return this as ReturnType<typeof postgrestQuery>
    },

    /** 작음 (column < value) */
    lt(column: string, value: string | number | boolean | null): ReturnType<typeof postgrestQuery> {
      filters.push({ column, op: 'lt', value })
      return this as ReturnType<typeof postgrestQuery>
    },

    /** 이하 (column <= value) */
    lte(column: string, value: string | number | boolean | null): ReturnType<typeof postgrestQuery> {
      filters.push({ column, op: 'lte', value })
      return this as ReturnType<typeof postgrestQuery>
    },

    /** LIKE (대소문자 구분) */
    like(column: string, pattern: string): ReturnType<typeof postgrestQuery> {
      filters.push({ column, op: 'like', value: pattern })
      return this as ReturnType<typeof postgrestQuery>
    },

    /** ILIKE (대소문자 무시) */
    ilike(column: string, pattern: string): ReturnType<typeof postgrestQuery> {
      filters.push({ column, op: 'ilike', value: pattern })
      return this as ReturnType<typeof postgrestQuery>
    },

    /** IS (null, true, false) */
    is(column: string, value: null | true | false): ReturnType<typeof postgrestQuery> {
      filters.push({ column, op: 'is', value })
      return this as ReturnType<typeof postgrestQuery>
    },

    /** IN (값 목록) */
    in(column: string, values: (string | number)[]): ReturnType<typeof postgrestQuery> {
      const inValue = `(${values.map(formatValue).join(',')})`
      filters.push({ column, op: 'in', value: inValue as unknown as string })
      return this as ReturnType<typeof postgrestQuery>
    },

    /** NOT (연산자 부정) 예: not.eq.값 */
    not(
      column: string,
      op: Exclude<FilterOp, 'is' | 'in'>,
      value: string | number | boolean
    ): ReturnType<typeof postgrestQuery> {
      const notValue = `${op}.${formatValue(value)}`
      filters.push({ column, op: 'not', value: notValue as unknown as string })
      return this as ReturnType<typeof postgrestQuery>
    },

    /** OR 조건. 조건들 중 하나만 만족하면 됨 */
    or(conditions: OrCondition[]): ReturnType<typeof postgrestQuery> {
      orConditions = conditions
      return this as ReturnType<typeof postgrestQuery>
    },

    /** 정렬. column 하나 또는 { column, dir } 여러 개 */
    orderBy(
      columnOrSpec: string | OrderSpec | (OrderSpec | [string, OrderDir])[],
      dir?: OrderDir
    ): ReturnType<typeof postgrestQuery> {
      if (typeof columnOrSpec === 'string') {
        orderSpecs.push({ column: columnOrSpec, dir: dir ?? 'asc' })
        return this as ReturnType<typeof postgrestQuery>
      }
      if (Array.isArray(columnOrSpec)) {
        for (const item of columnOrSpec) {
          if (Array.isArray(item)) {
            orderSpecs.push({ column: item[0], dir: item[1] })
          } else {
            orderSpecs.push(item)
          }
        }
        return this as ReturnType<typeof postgrestQuery>
      }
      orderSpecs.push({
        column: (columnOrSpec as OrderSpec).column,
        dir: (columnOrSpec as OrderSpec).dir
      })
      return this as ReturnType<typeof postgrestQuery>
    },

    /** 최대 행 개수 (Range 헤더 또는 limit 쿼리용) */
    limit(n: number): ReturnType<typeof postgrestQuery> {
      limitValue = n
      return this as ReturnType<typeof postgrestQuery>
    },

    /** 건너뛸 행 개수 */
    offset(n: number): ReturnType<typeof postgrestQuery> {
      offsetValue = n
      return this as ReturnType<typeof postgrestQuery>
    },

    /** URLSearchParams 생성 (fetch 시 query string + Range 헤더는 별도 설정) */
    toURLSearchParams(): URLSearchParams {
      const params = new URLSearchParams()
      params.set('select', selectColumns)

      for (const f of filters) {
        if (f.op === 'in') {
          params.set(f.column, `in.${f.value}`)
        } else if (f.op === 'not') {
          params.set(f.column, `not.${f.value}`)
        } else {
          params.set(f.column, `${f.op}.${encodeFilterValue(f.value)}`)
        }
      }

      if (orConditions.length > 0) {
        const orValue = orConditions
          .map(
            (c) =>
              `${c.column}.${c.op}.${c.op === 'in' ? c.value : encodeURIComponent(formatValue(c.value))
              }`
          )
          .join(',')
        params.set('or', `(${orValue})`)
      }

      if (orderSpecs.length > 0) {
        params.set(
          'order',
          orderSpecs.map((o) => `${o.column}.${o.dir}`).join(',')
        )
      }

      if (limitValue !== null && offsetValue !== null) {
        params.set('limit', String(limitValue))
        params.set('offset', String(offsetValue))
      } else if (limitValue !== null) {
        params.set('limit', String(limitValue))
      } else if (offsetValue !== null) {
        params.set('offset', String(offsetValue))
      }

      return params
    },

    /** Range 헤더 값 (limit/offset 기반). 예: '0-9' */
    getRangeHeader(): string | null {
      if (limitValue == null && offsetValue == null) return null
      const start = offsetValue ?? 0
      const end = limitValue != null ? start + limitValue - 1 : start
      return `${start}-${end}`
    },

    /** 쿼리 스트링만 반환 (예: select=*&uid=eq.123) */
    toString(): string {
      return this.toURLSearchParams().toString()
    }
  }
}

export type PostgrestQueryBuilder = ReturnType<typeof postgrestQuery>
