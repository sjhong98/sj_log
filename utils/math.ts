export const formatInputNumber = (
  value: string | number,
  toFormat: boolean = true
): string | number => {
  if (!value) return toFormat ? '' : 0

  value = value.toString().replace(/[^0-9]/g, '')

  if (toFormat) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  } else {
    return Number(value.toString().replace(/,/g, ''))
  }
}

export const convertToNumber = (str: string) => {
  return Number(str.replaceAll(',', ''))
}
