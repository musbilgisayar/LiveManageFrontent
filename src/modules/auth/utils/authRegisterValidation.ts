// src/modules/auth/utils/authRegisterValidation.ts

import { isE164Valid } from "@/app/components/input/IntlPhoneField";
import type {
  RegisterFormErrors,
  RegisterFormState,
} from "../types/AuthRegister.types";

export function validateRegisterForm(
  state: RegisterFormState,
  t: (key: string) => string
): RegisterFormErrors {
  const errors: RegisterFormErrors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const required = (key: string, fallback: string) => t(key) || fallback;

  if (!state.firstName.trim()) {
    errors.firstname = [required("validation:requiredFirstName", "Ad zorunludur.")];
  }

  if (!state.lastName.trim()) {
    errors.lastname = [required("validation:requiredLastName", "Soyad zorunludur.")];
  }

  if (!state.email.trim()) {
    errors.email = [required("validation:requiredEmail", "E-posta zorunludur.")];
  } else if (!emailRegex.test(state.email)) {
    errors.email = [t("validation:invalidEmail") || "Geçerli bir e-posta giriniz."];
  }

  if (!state.password) {
    errors.password = [required("validation:requiredPassword", "Şifre zorunludur.")];
  }

  if (!state.confirmPassword) {
    errors.confirmpassword = [
      required("validation:requiredConfirmPassword", "Şifre tekrarı zorunludur."),
    ];
  }

  if (
    state.password &&
    state.confirmPassword &&
    state.password !== state.confirmPassword
  ) {
    const message = t("validation:passwordsDoNotMatch") || "Parolalar eşleşmiyor.";

    errors.password = [...(errors.password ?? []), message];
    errors.confirmpassword = [...(errors.confirmpassword ?? []), message];
  }

  if (state.phoneNumber && !isE164Valid(state.phoneNumber)) {
    errors.phonenumber = [
      t("validation:invalidPhone") ||
        "Telefon numarası E.164 formatında olmalıdır. Örn: +905551112233",
    ];
  }

  return errors;
}