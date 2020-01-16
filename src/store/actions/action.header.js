import {
    ENABLE_HEADER
} from './actions.types'

export const toggleHeaderState = (headerState = false) => {
    return {
        type: ENABLE_HEADER,
        header: headerState
    }
}