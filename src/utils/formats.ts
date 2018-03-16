enum NumberFormat {
    Absolute = "absolute",
    Percentage = "percentage",
}

const formats = {
    number: {
        [NumberFormat.Absolute]: {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0,
            useGrouping: true,
        },
        [NumberFormat.Percentage]: {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
            style: "percent",
            useGrouping: true,
        },
    },
};

export { NumberFormat };
export default formats;
