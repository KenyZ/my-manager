import React from 'react'
import ReactDOM from 'react-dom'
import {
    BrowserRouter
} from 'react-router-dom'

import App from './components/App'
import StoreProvider from './utils/Store/StoreProvider'

ReactDOM.render(
    (
        <BrowserRouter>
            <StoreProvider>
                <App/>
            </StoreProvider>
        </BrowserRouter>
    ),
    document.getElementById('root')
)
