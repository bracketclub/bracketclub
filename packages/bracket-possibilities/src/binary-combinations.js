import { times } from 'lodash'

export default (n, yes = 1, no = 0) => times(Math.pow(2, n)).map((i) =>
  times(n).map((ii) => (i >> ii) & 1 ? yes : no)
)
