"use client";
import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const openModal = (signUpMode) => {
    setIsSignUp(signUpMode);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsSignUp(false);
  };

  return (
    <ModalContext.Provider value={{ showModal, isSignUp, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);