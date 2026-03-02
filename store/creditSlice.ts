import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CreditState {
    searchCredits: number;
}

const getInitialCredits = () => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("searchCredits");
        return saved ? parseInt(saved) : 3;
    }
    return 3;
};

const initialState: CreditState = {
    searchCredits: 3
};

const creditSlice = createSlice({
    name: "credits",
    initialState,
    reducers: {
        decreaseCredit: (state) => {
            if (state.searchCredits > 0) {
                state.searchCredits -= 1;
            }
        },

        resetCredits: (state) => {
            state.searchCredits = 3;
        },

        setCreditsFromStorage: (state, action: PayloadAction<number>) => {
            state.searchCredits = action.payload;
        },
    },
});

export const {
  decreaseCredit,
  resetCredits,
  setCreditsFromStorage
} = creditSlice.actions;
export default creditSlice.reducer;