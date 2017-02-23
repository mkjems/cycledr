// REDUCER

export const reducer = (state,action) => {
    // console.log('STATE', state);
    // console.log('ACTION', action);
    switch (action.type) {
      case 'ITEMS_LOADED':
          return Object.assign({},state, {
            items: [...state.items, ...action.data],
            loading: false
          })
      case 'LOAD_MORE':
          return Object.assign({},state,{
            offset : state.offset + state.limit,
            loading: true
          });
      case 'RESET_WITH_CHANNEL':
          return Object.assign({},state,{
            offset: 0,
            channel :action.data,
            loading: true
          });
      default:
          return state;
    }
}
