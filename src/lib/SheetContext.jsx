import React, { createContext, useContext, useState } from 'react';

const SheetContext = createContext({ isSheetOpen: false, setSheetOpen: () => {} });

export function SheetProvider({ children }) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  return (
    <SheetContext.Provider value={{ isSheetOpen, setSheetOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function useSheet() {
  return useContext(SheetContext);
}