import React, { createContext, useContext, useMemo } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const noopSign = async () => {
  throw new Error("Wallet trading is not configured in this app.");
};

export const AuthProvider = ({ children }) => {
  const value = useMemo(
    () => ({
      walletAddress: null,
      solanaAddress: null,
      proofToken: null,
      signAndSendSolanaTransaction: noopSign,
    }),
    [],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
