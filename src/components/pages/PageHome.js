import React from 'react'
import {
    Link
} from 'react-router-dom'

const PageHome = () => {
    return (
        <div className="page PageHome">
            <ul style={{padding: '3rem'}}>
                <li><Link to="/login">/login</Link></li>
                <li><Link to="/messages">/messages</Link></li>
            </ul>
        </div>
    )
}

export default PageHome