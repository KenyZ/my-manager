import moment from 'moment'

export const truncateText = (text, maxLength = 10) => text.substring(text, maxLength) + '...'

export const requestApi = (action
, {method = "POST", headers = {}, body, ...rest}) => {
    return fetch('/api' + action, {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        ...rest
    })
    .then(response => {
        
        return response.json().then(body => {
            return {
                ok: response.ok,
                status: response.status,
                body: body
            }
        })
    })
}

export const linkBy = (array, test) => {

    let groups = []
    let groupIndex = 0

    groups[0] = [array[0]]
    
    for(let i = 1; i < array.length; i++){
        let currentItem = array[i]
        let prevItem = array[i - 1]

        let group = groups[groupIndex] || []
        let testResult = false

        try {
            testResult = test(currentItem, prevItem)
            testResult = typeof testResult !== "undefined" ? testResult : false
        } catch (error) {
            
        }

        if(testResult){
            group.push(currentItem)
        } else {

            if(groups[groupIndex] instanceof Array && groups[groupIndex].length === 1){
                groups[groupIndex] = groups[groupIndex][0]
            }

            groupIndex++
            groups[groupIndex] = [currentItem]
        }
    }

    return groups

} 

export const getDate = dateFromDatabase => {

    const today = moment()

    // console.log({dateFromDatabase})
    // MUST GET A CORRECT DATE FORMAT FOR MOMENT

    let date = moment(dateFromDatabase)
    let diffHours = Math.abs(date.diff(today, 'hours', true))
    let diffDays = Math.abs(date.diff(today, 'days', true))
    let diffYears = Math.abs(date.diff(today, 'years'))
    let text = ""


    if(diffHours < 24){ // today 
        if(today.day() !== date.day()){ // yesterday but in 24h
            text = date.format("dddd HH:mm")
        } else {
            text = date.format("HH:mm")
        }
    } 
    else if(diffDays < 7){ // in week
        text = date.format("DD dddd")
    }
    else if(diffYears < 1){
        text = date.format("DD MMM")
    }
    else {
        text = date.format("DD MMM YYYY")
    } 

    return {text, date}
}

export const setClassName = (defaultClassName, conditionalClassName = {}) => {
    let className = defaultClassName

    for(let key in conditionalClassName){
        className += conditionalClassName[key] === true ? (" " + key) : ""
    }

    return className
}

 
export default {
    truncateText,
    linkBy,
    requestApi,
    getDate,
    setClassName
}