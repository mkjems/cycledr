import {run} from '@cycle/xstream-run'
import xs from 'xstream'
import {makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http';
import {App} from './app'

const main = App

const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver()
}

const s$ = xs.periodic(1000).take(50).map((val) => {
    console.log('VAL', val);
    return val;
})

run(main, drivers)
