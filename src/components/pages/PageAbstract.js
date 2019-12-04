import React from 'react'
import Header from '../shared/Header'

export const withHeader = (Page) => {
    return (
        <React.Fragment>
            <Header/>
            <Page/>
        </React.Fragment>
    )
}