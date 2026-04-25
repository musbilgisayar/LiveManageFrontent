import { border, borderColor, color } from "@mui/system";

 
export const textFieldStyle = {
  "& input::placeholder": {
    fontSize: "0.8rem",
    color: "rgba(134, 130, 152, 0.6)", // veya theme.palette.text.secondary
    opacity: 0.7,
  },
   height: 40, // tüm kutular yüksek olsun
  "& input": {
      backgroundColor: "#fff",   // 🔑 kutu içini beyaz yap
    color: "#464553ff",
    height: "100%",
    padding: "14px",
  },

};

