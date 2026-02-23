/**
 * 문자열을 snake_case에서 camelCase로 변환
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 객체/배열의 키를 재귀적으로 snake_case → camelCase로 변환
 * REST API(PostgREST 등) 응답을 앱에서 쓰는 camelCase 형태로 바꿀 때 사용
 */
export default function snakeToCamel<T>(value: T): T {
  if (value === null || value === undefined) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(item => snakeToCamel(item)) as T
  }

  if (typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        toCamelCase(key),
        snakeToCamel(val)
      ])
    ) as T
  }

  return value
}
