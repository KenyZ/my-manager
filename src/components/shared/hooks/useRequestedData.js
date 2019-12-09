import {
    useState,
    useEffect
} from 'react'


const useRequestedData = (request, receive, when = []) => {

    const [isFetching, setIsFetching] = useState(true)
    const [requestedData, setRequestedData] = useState(null)
    const [shouldUpdate, setShouldUpdate] = useState(false)


    useEffect(() => {
        setShouldUpdate(!shouldUpdate)
    }, when)

    useEffect(() => {
        request().then(data => {
            setRequestedData(data)
            return data
        }).then(data => {
            if(receive) receive(data)
        })
    }, [shouldUpdate])


    useEffect(() => {
        setIsFetching(requestedData === null)
    }, [requestedData])



    return {isFetching, requestedData}

}

export default useRequestedData