"use client";
import React from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Box, FormControl, FormHelperText, InputLabel } from "@mui/material";

/**
 * MUI temalı uluslararası telefon alanı.
 * TS tipleri tamamen tanımlanmıştır.
 */
export type IntlPhoneFieldProps = {
  label?: string;
  value?: string;                         // E.164 formatı: +905551112233
  onChange?: (val: string) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  defaultCountry?: string;                // "TR" | "US" | "DE" ...
  id?: string;
  disabled?: boolean;
};

export const isE164Valid = (phone?: string) => !!phone && isValidPhoneNumber(phone);

export default function IntlPhoneField({
  label,
  value,
  onChange,
  error,
  helperText,
  required,
  defaultCountry,
  id = "intl-phone-input",
  disabled,
}: IntlPhoneFieldProps) {
  return (
    <FormControl fullWidth error={!!error} disabled={disabled}>
      {label && (
        <InputLabel shrink required={required} htmlFor={id} sx={{ mb: 0.5 }}>
          {label}
        </InputLabel>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          "& .PhoneInput": {
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: 44,
            border: 1,
            borderRadius: 2,
            borderColor: error ? "error.main" : "divider",
            px: 1.2,
            bgcolor: "background.paper",
            "&:hover": { borderColor: error ? "error.main" : "text.secondary" },
            "&:focus-within": {
              borderColor: error ? "error.main" : "primary.main",
              boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}`,
            },
          },
          "& .PhoneInputCountry": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 1,
            height: "100%",
            "& select": {
              cursor: "pointer",
              border: "none",
              background: "transparent",
              fontSize: 14,
              outline: "none",
              height: "100%",
            },
          },
          "& .PhoneInputInput": {
            flex: 1,
            height: "100%",
            fontSize: 15,
            border: "none",
            outline: "none",
            background: "transparent",
            "&::placeholder": { color: "text.disabled" },
          },
        }}
      >
        <PhoneInput
          id={id}
          international
          withCountryCallingCode
          defaultCountry={defaultCountry as any}
          value={value}
          onChange={(val: string | undefined) => onChange?.(val ?? "")}
          numberInputProps={{
            required,
            disabled,
            placeholder: "+90 555 111 2233",
          }}
        />
      </Box>

      {helperText && (
        <FormHelperText sx={{ mt: 0.25, fontSize: 13 }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}



// src/app/components/input/IntlPhoneField.tsx

/*
"use client";
import React from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Box, FormControl, FormHelperText, InputLabel } from "@mui/material";

 
export type IntlPhoneFieldProps = {
  label?: string;
  value?: string;                          
  onChange?: (val: string) => void;        
  error?: boolean;
  helperText?: string;
  required?: boolean;
  defaultCountry?: string;               
  id?: string;
  disabled?: boolean;
};

export const isE164Valid = (phone?: string) => !!phone && isValidPhoneNumber(phone);

export default function IntlPhoneField({
  label = "Phone",
  value,
  onChange,
  error,
  helperText,
  required,
  defaultCountry,
  id = "intl-phone-input",
  disabled,
}: IntlPhoneFieldProps) {
  // MUI ile görsel uyum: TextField benzeri input yüksekliği/kenarlıklar
  return (
    <FormControl fullWidth error={!!error} variant="outlined" disabled={disabled}>
      {label && (
        <InputLabel shrink required={required} htmlFor={id} sx={{ mb: 0.5 }}>
          {label}
        </InputLabel>
      )}

      <Box
        // MUI theme ile CSS override
        sx={{
          display: "flex",
          "& .PhoneInput": {
            display: "flex",
            width: "100%",
            alignItems: "center",
            gap: 1,
          },
            "& .PhoneInputCountry": {
                height: 40,
                width: 40,           
                minWidth: 40,
                p: 0,                 
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": { borderColor: "text.secondary" },
                position: "relative",
                },
          "& .PhoneInputCountrySelect": {
            cursor: "pointer",
          },
          "& .PhoneInputCountryIcon": {
            width: 20,
            height: 14,
            mr: 0,
          },
          "& .PhoneInputCountrySelectArrow": {
                osition: "absolute",  
                right: 4,
                bottom: 4,
                transform: "scale(0.9)",
          },
          "& .PhoneInputInput": {
            height: 40,
            flex: 1,
            width: "100%",
            borderRadius: 1,
            border: 1,
            borderColor: error ? "error.main" : "divider",
            outline: "none",
            px: 1.5,
            fontSize: 16,
            "&:hover": { borderColor: error ? "error.main" : "text.secondary" },
            "&:focus": {
              borderColor: error ? "error.main" : "primary.main",
              boxShadow: (theme) => `0 0 0 3px ${theme.palette.action.focus}`,
            },
            "&::placeholder": { color: "text.disabled" },
          },
        }}
      >
        <PhoneInput
          id={id}
          international
          withCountryCallingCode
          defaultCountry={defaultCountry as any}
          value={value}
          onChange={(val: string | undefined) => onChange?.(val ?? "")}  
          numberInputProps={{
            required,
            disabled,
            placeholder: "+90 555 111 2233",
            onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
              
              const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End", " "];
              const isDigit = e.key >= "0" && e.key <= "9";
              if (!allowed.includes(e.key) && !isDigit && e.key !== "+") e.preventDefault();
            },
          }}
        />
      </Box>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

*/