import type { Entity } from '../../src/module'

export interface Todo extends Entity<number> {
  title: string
  completed: boolean
  userId: number
};

export interface Incident extends Entity<string> {
  created?: Date
  modified?: Date
  number?: string
  title?: string
  type?: string
  status?: string
  user?: string
  tags?: string[]
  provider?: string
  request?: string
}
