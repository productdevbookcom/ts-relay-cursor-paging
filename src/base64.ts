import { Buffer } from 'node:buffer'

export function encodeBase64(value: string): string {
  return Buffer.from(value).toString('base64')
}
const base64Regex = /^(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=)?$/
export function decodeBase64(value: string): string {
  if (!base64Regex.test(value))
    throw new Error('Invalid base64 string')

  return Buffer.from(value, 'base64').toString()
}
