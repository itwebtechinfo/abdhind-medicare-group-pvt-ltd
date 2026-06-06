import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GlobalState {
  isSidebarOpen: boolean;
  theme: "light" | "dark" | "system";
}

const initialState: GlobalState = {
  isSidebarOpen: true,
  theme: "system",
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;
    },
  },
  
});

export const { toggleSidebar, setTheme } = globalSlice.actions;
export default globalSlice.reducer;