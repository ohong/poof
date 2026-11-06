"use client";
import { useEffect } from "react";

export function InputModality() {
  useEffect(() => {
    const keyboard = () => {
      if (document.documentElement.dataset.input !== "keyboard")
        document.documentElement.dataset.input = "keyboard";
    };
    const pointer = () => {
      if (document.documentElement.dataset.input !== "pointer")
        document.documentElement.dataset.input = "pointer";
    };
    document.addEventListener("keydown", keyboard, true);
    document.addEventListener("pointerdown", pointer, true);
    return () => {
      document.removeEventListener("keydown", keyboard, true);
      document.removeEventListener("pointerdown", pointer, true);
    };
  }, []);
  return null;
}
