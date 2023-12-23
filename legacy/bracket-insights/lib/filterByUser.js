module.exports = (o) => (entry) =>
  o.user ? entry.user.username.toLowerCase() === o.user.toLowerCase() : true
