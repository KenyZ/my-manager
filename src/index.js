import React from 'react'
import ReactDOM from 'react-dom'
import {
    BrowserRouter
} from 'react-router-dom'
import {
    Provider
} from 'react-redux'

import App from './components/App'
import store from './store/store'

import {ThemeProvider} from '@material-ui/core'
import MaterialTheme from './utils/MaterialTheme'

ReactDOM.render(
    (
        <ThemeProvider theme={MaterialTheme}>
            <Provider store={store}>
                <BrowserRouter>
                        <App/>
                </BrowserRouter>
            </Provider>
        </ThemeProvider>
    ),
    document.getElementById('root')
)
