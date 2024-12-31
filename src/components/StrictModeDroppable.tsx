import { useEffect, useState, PropsWithChildren } from 'react'
import { Droppable, DroppableProps } from 'react-beautiful-dnd'

export const StrictModeDroppable = ({ children, ...props }: PropsWithChildren<DroppableProps>) => {
    const [enabled, setEnabled] = useState(false)
    
    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true))
        return () => {
            cancelAnimationFrame(animation)
            setEnabled(false)
        }
    }, [])

    if (!enabled) {
        return null
    }

    return <Droppable {...props}>{children}</Droppable>
}