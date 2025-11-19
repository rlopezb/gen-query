import type { FilterItem, Sort } from './types'

export class ApiError extends Error {
  timestamp: Date
  override cause: unknown
  override message: string
  override name: string
  override stack?: string
  type: string
  statusCode: number
  status: string
  content?: object

  constructor(message: string, type: string, name: string, stack: string | undefined, statusCode: number, status: string, content: object, cause: unknown) {
    super(message, { cause: cause })
    this.message = message
    this.cause = cause
    this.timestamp = new Date()
    this.type = type
    this.name = name
    this.stack = stack
    this.statusCode = statusCode
    this.status = status
    this.content = content
  }
}

export const formatDate = (date: string | Date): string => {
  if (date instanceof Date) {
    return date.toLocaleDateString('en-CA')
  }
  return new Date(date).toLocaleDateString('en-CA')
}

const isoDateFormat = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+(?:[+-][0-2]\d:[0-5]\d|Z)/
export const isIsoDateString = (value: unknown): boolean =>
  typeof value === 'string' && isoDateFormat.test(value)

export const handleDates = <T>(body: T): T => {
  if (!body || typeof body !== 'object') return body

  for (const key of Object.keys(body)) {
    const value = (body as Record<string, unknown>)[key]
    if (typeof value === 'string' && isIsoDateString(value)) {
      (body as Record<string, unknown>)[key] = new Date(value)
    }
    else if (typeof value === 'object' && value !== null) {
      (body as Record<string, unknown>)[key] = handleDates(value)
    }
  }
  return body
}

export class Pageable {
  page: number
  size: number
  sort: Sort[]

  constructor(page: number = 0, size: number = 30, sort: Sort[] = []) {
    this.page = page
    this.size = size
    this.sort = sort
  }

  public toQueryParams = (): string => [
    `size=${encodeURIComponent(this.size)}`,
    `page=${encodeURIComponent(this.page)}`,
    ...this.sort.map(sort => `sort=${encodeURIComponent(sort.property)},${encodeURIComponent(sort.direction)}`),
  ].join('&')
}

export class Filters {
  [key: string]: FilterItem | (() => string);

  public toQueryParams = (): string => {
    const params: string[] = []
    for (const [field, filterItem] of Object.entries(this)) {
      if (typeof filterItem !== 'function') {
        const constraints = filterItem.constraints.filter(c => c.value)
        if (constraints.length > 1) {
          const conditions = constraints.map(c => `${field}:${c.matchMode}:${c.value}`)
          params.push(`filter=${encodeURIComponent(conditions.join(filterItem.operator === 'and' ? '&' : '|'))}`)
        }
        else if (constraints.length === 1) {
          const constraint = constraints[0]
          const matchMode = constraint.matchMode
          let value = constraint.value
          if (value instanceof Date) {
            value = formatDate(value.toISOString())
          }
          params.push(`filter=${encodeURIComponent(`${field}‚${matchMode}‚${value}`)}`)
        }
      }
    }
    return params.join('&')
  }
}
