const Order = {
  Sixteen: [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15],
  Eight: [1, 8, 4, 5, 2, 7, 3, 6],
  Four: [1, 4, 2, 3],
}

export const NBA = {
  regions: 2,
  order: Order.Eight,
  bestOf: 7,
}

export const NCAAM = {
  regions: 4,
  order: Order.Sixteen,
  bestOf: 1,
}

export const NCAAW = NCAAM

export const NHL = {
  regions: 4,
  order: Order.Four,
  bestOf: 7,
}

export const WCM = {
  regions: 2,
  order: Order.Eight,
  bestOf: ["FT", "ET", "PK"],
}

export const WCW = WCM
