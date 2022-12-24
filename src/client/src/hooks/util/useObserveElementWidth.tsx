import { useState, useRef, useEffect } from "react";


export const useObserveElementWidth = <T extends HTMLElement>() => {
    const [width, setWidth] = useState(0);
    const ref = useRef<T>(null);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            setWidth(entries[0].contentRect.width);
        });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            ref.current && observer.unobserve(ref.current);
        };
    }, []);

    return {
        width,
        ref
    };
};