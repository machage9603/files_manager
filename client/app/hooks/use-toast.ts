"use client"

// Inspired by react-hot-toast library
import { useState, useEffect, useCallback, type ReactNode } from "react"

export type ToastProps = {
    id: string
    title?: string
    description?: ReactNode
    action?: ReactNode
    variant?: "default" | "destructive"
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
    id: string
    title?: string
    description?: ReactNode
    action?: ReactNode
    variant?: "default" | "destructive"
}

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER
    return count.toString()
}

type UseToast = {
    toast: (props: Omit<ToasterToast, "id">) => string
    dismiss: (toastId?: string) => void
    toasts: ToasterToast[]
}

export const useToast = (): UseToast => {
    const [toasts, setToasts] = useState<ToasterToast[]>([])

    useEffect(() => {
        const timers = toasts.map((toast) => {
            const timer = setTimeout(() => {
                setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toast.id))
            }, TOAST_REMOVE_DELAY)

            return { id: toast.id, timer }
        })

        return () => {
            timers.forEach((timer) => clearTimeout(timer.timer))
        }
    }, [toasts])

    const toast = useCallback(
        ({ ...props }: Omit<ToasterToast, "id">) => {
            const id = genId()

            setToasts((prevToasts) => {
                const newToasts = [{ id, ...props }, ...prevToasts].slice(0, TOAST_LIMIT)

                return newToasts
            })

            return id
        },
        [setToasts],
    )

    const dismiss = useCallback(
        (toastId?: string) => {
            setToasts((prevToasts) => (toastId ? prevToasts.filter((toast) => toast.id !== toastId) : []))
        },
        [setToasts],
    )

    return {
        toast,
        dismiss,
        toasts,
    }
}
