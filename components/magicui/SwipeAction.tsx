import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface SwipeActionProps {
    children: React.ReactNode;
    rightActions?: React.ReactNode;
}

export function SwipeAction({ children, rightActions }: SwipeActionProps) {
    const x = useMotionValue(0);
    const swipeRef = useRef<HTMLDivElement>(null);

    return (
        <div className="relative w-full overflow-hidden rounded-[32px] group" ref={swipeRef}>
            {/* Background Actions */}
            <div className="absolute inset-y-0 right-0 w-[100px] flex items-center justify-end z-0">
                {rightActions}
            </div>

            {/* Draggable Top Layer */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                dragElastic={0.1}
                dragDirectionLock
                style={{ x }}
                className="relative z-10 w-full h-full bg-white rounded-[32px]"
            >
                {children}
            </motion.div>
        </div>
    );
}
