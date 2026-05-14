// src/app/components/shared/styles.ts

export const textFieldStyle = {
  minHeight: 56,
  borderRadius: "14px",

  background:
    "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,255,1) 100%)",

  transition: "all 0.2s ease",

  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",

  "&:hover": {
    boxShadow: "0 4px 14px rgba(99,102,241,0.08)",
  },

  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    background: "transparent",

    "& fieldset": {
      borderColor: "rgba(148,163,184,0.28)",
      transition: "all 0.2s ease",
    },

    "&:hover fieldset": {
      borderColor: "rgba(99,102,241,0.45)",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#5B7FFF",
      borderWidth: "1.5px",
      boxShadow: "0 0 0 4px rgba(91,127,255,0.10)",
    },
  },

  "& .MuiOutlinedInput-input": {
    padding: "14px 14px",
    color: "#2b3445",
    fontSize: "0.95rem",
    fontWeight: 500,
    backgroundColor: "transparent",
  },

  "& .MuiInputAdornment-root": {
    color: "rgba(71,85,105,0.72)",
    transition: "color 0.2s ease",
  },

  "& .MuiOutlinedInput-root.Mui-focused .MuiInputAdornment-root": {
    color: "#5B7FFF",
  },

  "& input::placeholder": {
    fontSize: "0.84rem",
    color: "rgba(100,116,139,0.72)",
    opacity: 1,
  },

  "& .MuiInputLabel-root": {
    fontWeight: 500,
    color: "rgba(71,85,105,0.84)",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "#5B7FFF",
  },
};