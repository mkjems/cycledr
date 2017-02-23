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
import delay from 'xstream/extra/delay'


import {buttonArr, defaultState} from './constants'
import {reducer} from './reducer'
import {createAction, makeUrl} from './helpers'
import {logger, logObj} from './logger'


export function App(sources) {
    // INTENT
    const button$ = sources.DOM.select('.drButton').events('click')
        .map(ev => {
            return createAction(
              'RESET_WITH_CHANNEL',
              ev.target.getAttribute('data-id')
            )
        })


    const loadMoreIntent$ = sources.DOM.select('.more').events('click')
        .map(ev=>{ev.preventDefault(); return createAction('LOAD_MORE')});

    const actions$ = xs.merge(button$,loadMoreIntent$)


    // MODEL
    const state$ = actions$.fold((state, action) => {
        return reducer(state, action);
    }, defaultState);

    state$.addListener({
        next: (val) => {
            logObj(val, 'state');
        }
    })

    const req$ = state$
        .map((state) => {
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

    const loadedItems$ = items$
        .map(items => {return createAction('ITEMS_LOADED', items)});

    // const foldedItems$ = items$.fold((acc, seed) => acc.concat(seed), [])

    // const stateWithItems$ = xs.combine(items$, state$).fold((acc,latest)=>{
    // },{})

    const stateAndLoaded$ = xs.combine(state$,loadedItems$).map(val=>{
      return reducer(val[0],val[1]);
    });

    stateAndLoaded$.addListener({
        next: (val) => {
            logObj(val,'loaded');
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

    const items2$ = xs.of([]);
    let vdom$ = items2$
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
