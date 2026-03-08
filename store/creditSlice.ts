import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const MAX_FREE_UNLOCKS = 3;

interface CreditState {
    ownerUnlocks: number; // how many owner details unlocked so far
    unlockedProperties: string[]; // property IDs/slugs already unlocked
}

const initialState: CreditState = {
    ownerUnlocks: 0,
    unlockedProperties: [],
};

const creditSlice = createSlice({
    name: "credits",
    initialState,
    reducers: {
        unlockOwnerDetail: (state, action: PayloadAction<string>) => {
            const slug = action.payload;
            if (!state.unlockedProperties.includes(slug)) {
                state.unlockedProperties.push(slug);
                state.ownerUnlocks += 1;
            }
        },

        setCreditsFromStorage: (
            state,
            action: PayloadAction<{ ownerUnlocks: number; unlockedProperties: string[] }>
        ) => {
            state.ownerUnlocks = action.payload.ownerUnlocks;
            state.unlockedProperties = action.payload.unlockedProperties;
        },
    },
});

export const MAX_UNLOCKS = MAX_FREE_UNLOCKS;
export const { unlockOwnerDetail, setCreditsFromStorage } = creditSlice.actions;
export default creditSlice.reducer;
