export const SLOT_COLORS_MAP: Record<string, string> = {
    pink: "bg-pink-400",
    red: "bg-red-400",
    orange: "bg-orange-400",
    yellow: "bg-yellow-400",
    green: "bg-green-400",
    blue: "bg-blue-400",
    indigo: "bg-indigo-400",
    violet: "bg-violet-400",
};

export const getSlotBg = (colorData: any) => {
    if (!colorData) return "bg-zinc-200";

    // Gawing lowercase at string para madaling ihambing
    const colorStr = String(colorData).toLowerCase();

    // Hanapin kung anong key ang "kasama" sa string na galing Firebase
    // Halimbawa: Kung colorStr ay "Pink Slot", makikita niya ang "pink" sa keys
    const match = Object.keys(SLOT_COLORS_MAP).find((key) =>
        colorStr.includes(key)
    );

    return match ? SLOT_COLORS_MAP[match] : "bg-zinc-200";
};