import type { FilterItem, Sort } from './types'

/**
 * Custom error class for API errors.
 */
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

/**
 * Formats a date to 'YYYY-MM-DD' string.
 * @param date The date to format.
 * @returns The formatted date string.
 */
export const formatDate = (date: string | Date): string => {
  if (date instanceof Date) {
    return date.toLocaleDateString('en-CA')
  }
  return new Date(date).toLocaleDateString('en-CA')
}

const isoDateFormat = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+(?:[+-][0-2]\d:[0-5]\d|Z)/

/**
 * Checks if a value is an ISO date string.
 * @param value The value to check.
 * @returns True if the value is an ISO date string, false otherwise.
 */
export const isIsoDateString = (value: unknown): boolean =>
  typeof value === 'string' && isoDateFormat.test(value)

/**
 * Recursively converts ISO date strings in an object to Date objects.
 * @param body The object to process.
 * @returns The object with Date objects.
 */
export const handleDates = <T>(body: T): T => {
  if (!body || typeof body !== 'object') return body
  if (Array.isArray(body)) return body.map(handleDates) as T

  for (const key of Object.keys(body)) {
    const value = (body as Record<string, unknown>)[key]
    if (isIsoDateString(value)) {
      (body as Record<string, unknown>)[key] = new Date(value as string)
    }
    else if (value && typeof value === 'object') {
      (body as Record<string, unknown>)[key] = handleDates(value)
    }
  }
  return body
}

/**
 * Class representing pagination configuration.
 */
export class Pageable {
  page: number
  size: number
  sort: Sort[]

  constructor(page: number = 0, size: number = 30, sort: Sort[] = []) {
    this.page = page
    this.size = size
    this.sort = sort
  }

  /**
   * Converts pagination configuration to query parameters string.
   * @returns Query parameters string.
   */
  public toQueryParams = (): string => [
    `size=${encodeURIComponent(this.size)}`,
    `page=${encodeURIComponent(this.page)}`,
    ...this.sort.map(sort => `sort=${encodeURIComponent(sort.property)},${encodeURIComponent(sort.direction)}`),
  ].join('&')
}

/**
 * Class representing filter configuration.
 */
export class Filters {
  [key: string]: FilterItem | (() => string);

  /**
   * Converts filters to query parameters string.
   * @returns Query parameters string.
   */
  public toQueryParams = (): string => {
    const params: string[] = []

    for (const [field, filterItem] of Object.entries(this)) {
      if (typeof filterItem === 'function') continue

      const constraints = filterItem.constraints.filter(c => c.value)
      if (constraints.length === 0) continue

      if (constraints.length > 1) {
        const conditions = constraints.map(c => `${field}:${c.matchMode}:${c.value}`)
        const separator = filterItem.operator === 'and' ? '&' : '|'
        params.push(`filter=${encodeURIComponent(conditions.join(separator))}`)
      }
      else {
        const { matchMode, value } = constraints[0]!
        const formattedValue = value instanceof Date ? formatDate(value.toISOString()) : value
        params.push(`filter=${encodeURIComponent(`${field}‚${matchMode}‚${formattedValue}`)}`)
      }
    }

    return params.join('&')
  }
}
