import moment from 'moment'

export const truncateText = (text, maxLength = 10) => text.substring(text, maxLength) + '...'

export const requestApi = (action, {method = null, headers = {}, body = {}, ...rest}) => {
    return fetch('http://localhost:3000/api/' + action, {
        method: method || 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...headers
        },
        body: JSON.stringify(body),
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
    let diffHours = date.diff(today, 'hours', true)
    let diffDays = date.diff(today, 'days')
    let diffYears = date.diff(today, 'years')
    let text = ""

    if(diffYears <= -1){ // + 1ans
        text = date.format("MMM YYYY")
    } 
    else if(diffDays <= -1){ // + 1 jour
        if(diffDays <= -7){  // + 7 jours
            text = date.format("DD MMM ")
        } 
        else if(diffDays === -1){ // 1 day ago
            text =  "yesterday"
        }
        else {
            text = date.format("dddd")   
        }

    }
    else { // - 24hours

        if(today.day() !== date.day()){ // lasterday
            text = "yesterday"
        } else {
            text = date.format("HH:mm")
        }
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