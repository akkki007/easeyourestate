"use client";

import { useRef, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
}

export default function OtpInput({ value, onChange, length = 6, autoFocus = true }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into individual characters
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const focusInput = (index: number) => {
    const target = inputsRef.current[index];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    // Take only the last character typed (in case of rapid input)
    const digit = val.slice(-1);
    const newValue = value.split("");
    newValue[index] = digit;
    // Fill forward if there are more chars (shouldn't happen normally, but safety)
    const result = newValue.join("").slice(0, length);
    onChange(result);

    // Auto-advance to next input
    if (index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newValue = value.split("");

      if (newValue[index]) {
        // Clear current digit
        newValue[index] = "";
        onChange(newValue.join(""));
      } else if (index > 0) {
        // Move back and clear previous digit
        newValue[index - 1] = "";
        onChange(newValue.join(""));
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted);
      // Focus the next empty or the last input
      const nextIndex = Math.min(pasted.length, length - 1);
      focusInput(nextIndex);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          aria-label={`Digit ${index + 1} of ${length}`}
          className="
            w-11 h-13 sm:w-13 sm:h-15
            text-center text-xl sm:text-2xl font-bold
            rounded-xl
            border-2 border-border
            bg-background text-foreground
            focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
            transition-all duration-200
            placeholder:text-muted-foreground
            caret-primary
          "
        />
      ))}
    </div>
  );
}
