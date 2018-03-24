import { extSelector, getWindowError } from './ExtJSHelper/ExtJSSelector'
import { Selector, ClientFunction } from 'testcafe'

const testPage = `http://localhost:888/adm-dev`

fixture(`Preparing data for Move folder and shortcut to Desktop test`)
  .page(testPage)
