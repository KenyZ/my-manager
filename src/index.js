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

ReactDOM.render(
    (
        <Provider store={store}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </Provider>
    ),
    document.getElementById('root')
)

// const target = {
//     age: 12,
//     note: [
//         {type: 0, value: 4.3},
//         {type: 1, value: 1.5},
//         {type: 2, value: 7.2},
//     ],
//     minor: true,
//     school: {name: 'Toei', private: false, count: 405}
// }

// const mergeObject = (target, source) => {

//     let merged = {
//         ...target
//     }



//     for(let key in source){
//         let sourceValue = source[key]


//         if(sourceValue instanceof Object){
//             merged[key] = mergeObject(
//                 (merged[key] || {}),
//                 sourceValue
//             )
//         } else {
//             merged[key] = sourceValue
//         }
//     }

//     return merged
// }


// console.log(
//     JSON.stringify(
//         mergeObject(
//             target,
//             {
//                 age: 11,
//                 school: {
//                     name: "Toei school",
//                     private: true
//                 },
//                 note: [
//                     {type: }
//                 ]
//             }
//         ),
//         undefined,
//         4
//     )
// )
