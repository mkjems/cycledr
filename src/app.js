import {
    div,
    button,
    h1,
    h3,
    h4,p,
    h,
    img,
    a
} from '@cycle/dom'
import xs from 'xstream'

export function App(sources) {

    const buttonArr = [{
        name: 'DR1',
        slug: 'dr1'
    }, {
        name: 'DR2',
        slug: 'dr2'
    }, {
        name: 'DR3',
        slug: 'dr3'
    }, {
        name: 'DRK',
        slug: 'dr-k'
    }];

    const defaultState = {
      limit: 2,
      offset: 0,
      channel: 'dr1',
      loading: false,
      items: []
    };

    const createAction = (type,data) => {
      return {type,data};
    }

    const makeUrl = (channel, offset, limit) => `http://www.dr.dk/mu-online/api/1.3/list/view/lastchance?limit=${limit}&offset=${offset}&channel=${channel}`

    // REDUCERS

    const reducer = (state=defaultState,action) => {
        switch (action.type) {
          case 'LOAD_MORE':
              return Object.assign({},state,{
                offset : state.offset + state.limit,
                loading: true
              };
          case 'RESET_WITH_CHANNEL':
              return Object.assign({},state,{
                offset: 0;
                channel :action.data.channel;
                loading: true
              });
          default:
              return state;
        }
    }

    // INTENT
    const button$ = sources.DOM.select('.drButton').events('click')
        .map(ev => createAction('RESET_WITH_CHANNEL',ev.target.getAttribute('data-id')))

    const loadMoreIntent$ = sources.DOM.select('.more').events('click')
        .map(ev=>{ev.preventDefault(); return createAction('LOAD_MORE')});

    const actions$ = xs.merge(button$,loadMoreIntent$)

    // MODEL
    const state$ = actions$.fold((acc, seed) => {
        if (seed=='loadmore' || acc.channel == seed) {
            acc.offset = acc.offset + acc.limit
        } else {
            acc.offset = 0;
            acc.channel = seed;
        }
        acc.loading = true;
        return acc;
    }, defaultState);

    state$.addListener({
        next: (val) => {
            console.log('STATE-next', val);
        }
    })

    const req$ = state$
        .map((state) => {
            //console.log(val);
            return {
                url: makeUrl(state.channel, state.offset, state.limit),
                category: 'users',
                method: 'GET'
            };
        });

    const response$ = sources.HTTP
        .select('users')
        .flatten();

    const items$ = response$
        .map(rsp => {
            return JSON.parse(rsp.text);
        }).map(textObj => textObj.Items)

    const foldedItems$ = items$.fold((acc, seed) => acc.concat(seed), [])

    const stateWithItems$ = xs.combine(items$, state$).fold((acc,latest)=>{
    },{})

    stateWithItems$.addListener({
        next: (val) => {
            console.log('STATE-ITEMS', val);
        }
    })




    // VIEW

    const vtree$ = xs.of(
        div('.MyAwesome', buttonArr.map(({
            name,
            slug
        }) => {
            return button('.drButton', {
                "attrs": {
                    'data-id': slug
                },
                "style": {
                    color: 'red'
                }
            }, name)
        }))
    )

    let vdom$ = foldedItems$
        .map(items => {
            const children = items.map((item) => {
                // console.log(item);
                return div('.item', [
                    img('.img', {
                        attrs: {
                            src: item.PrimaryImageUri
                        }
                    }),
                    p(item.SeriesTitle + ' ' + item.PrimaryChannelSlug)
                ])
            })
            return div('.items', children);
        });

    const moreButton$ = xs.of( div('.load-more', [
      a('.more', {'attrs':{href:''}},['load more'])
    ]))

    const dom$ = xs.combine(vtree$, vdom$, moreButton$).map(vnodes => div(vnodes));

    const sinks = {
        DOM: dom$,
        HTTP: req$
    }
    return sinks
}
