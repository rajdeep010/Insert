"use client";

import { motion } from "motion/react";
import { fadeUp } from "./variants";

type Props = {
    children: React.ReactNode;
};

export default function FadeUp({ children }: Props) {
    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{
                once: true,
                amount: 0.3,
            }}
        >
            {children}
        </motion.div>
    );
}