type ClerkError = {
  errors?: Array<{ message: string; code: string }>;
};

export interface AuthErrorResult {
  message: string;
  code: string | null;
  shouldRedirect: boolean;
  redirectUrl: string | null;
}

const errorMessages: Record<string, string> = {
  form_password_incorrect: "Senha incorreta. Tente novamente.",
  form_identifier_not_found: "Email não encontrado. Verifique o endereço.",
  form_code_incorrect: "Código incorreto. Verifique e tente novamente.",
  form_password_pwned: "Esta senha foi exposta em vazamentos de dados. Use outra.",
  form_password_length_too_short: "A senha deve ter pelo menos 8 caracteres.",
  session_exists: "",
  strategy_for_user_invalid: "Por favor, tente novamente.",
};

export function handleClerkError(err: unknown): AuthErrorResult {
  const clerkError = err as ClerkError;

  if (clerkError.errors && clerkError.errors.length > 0) {
    const errorCode = clerkError.errors[0].code;
    const errorMessage = clerkError.errors[0].message;

    if (errorCode === "session_exists") {
      return {
        message: "",
        code: errorCode,
        shouldRedirect: true,
        redirectUrl: "/",
      };
    }

    const translatedMessage = errorMessages[errorCode] || errorMessage;

    return {
      message: translatedMessage,
      code: errorCode,
      shouldRedirect: false,
      redirectUrl: null,
    };
  }

  return {
    message: "Erro inesperado. Tente novamente.",
    code: null,
    shouldRedirect: false,
    redirectUrl: null,
  };
}

export function redirectAfterAuth(path: string = "/"): void {
  window.location.href = path;
}

export function getSecondFactorLabel(strategy: string | null): string {
  switch (strategy) {
    case "totp":
      return "Código do Autenticador";
    case "phone_code":
      return "Código SMS";
    case "backup_code":
      return "Código de Backup";
    case "email_code":
      return "Código de Email";
    default:
      return "Código de Verificação";
  }
}

export function getSecondFactorDescription(strategy: string | null): string {
  switch (strategy) {
    case "totp":
      return "Digite o código de 6 dígitos do seu aplicativo autenticador (Google Authenticator, Authy, etc.)";
    case "phone_code":
      return "Digite o código enviado para o seu celular";
    case "backup_code":
      return "Digite um dos seus códigos de backup";
    case "email_code":
      return "Digite o código enviado para o seu email";
    default:
      return "Digite o código de verificação";
  }
}
