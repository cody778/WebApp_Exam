/** Missing records and malformed record IDs should use the Not Found screen. */
export function isUnavailableItem(error) {
  return error?.code === 'PGRST116' || error?.code === '22P02'
}
