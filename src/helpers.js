export const createAction = (type,data) => {
  return {type,data};
}

export const makeUrl = (channel, offset, limit) => `http://www.dr.dk/mu-online/api/1.3/list/view/lastchance?limit=${limit}&offset=${offset}&channel=${channel}`
