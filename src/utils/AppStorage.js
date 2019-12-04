
const APP_STORAGE_NAME = "my_manager_storage"

function AppStorage(){

    if(!window.localStorage.getItem(APP_STORAGE_NAME)){
        window.localStorage.setItem(APP_STORAGE_NAME, JSON.stringify({}))
    }

    const _getStorage = () => JSON.parse(window.localStorage.getItem(APP_STORAGE_NAME))
    
    this.set = (key, value) => {
        let prevStorage = _getStorage()
        prevStorage[key] = value
        window.localStorage.setItem(APP_STORAGE_NAME, JSON.stringify(prevStorage))
    }

    this.get = (key = null) => {
        let storage = _getStorage()
        return key ? storage[key] : storage
    }

    

    return this

}


const instance = new AppStorage()

export default instance