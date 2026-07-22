export const fadeUp = {
    hidden: {
        opacity: 0,
        y: 40,
        filter: "blur(10px)",
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.5,
            ease: "easeInOut",
        },
    },
};

export const fadeLeft = {
    hidden: {
        opacity: 0,
        x: -40,
        filter: "blur(8px)",
    },
    visible: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.6,
        },
    },
};

export const fadeRight = {
    hidden: {
        opacity: 0,
        x: 40,
        filter: "blur(8px)",
    },
    visible: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.6,
        },
    },
};

export const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
        },
    },
};

export const staggerItem = {
    hidden: {
        opacity: 0,
        y: 30,
    },
    visible: {
        opacity: 1,
        y: 0,
    },
};