export interface SubmitResult {
  ok: boolean;
}

export interface FormSubmitter {
  submit(body: FormData, signal: AbortSignal): Promise<SubmitResult>;
}

interface Web3FormsResponse {
  success?: boolean;
}

export function createWeb3FormsSubmitter(endpoint: string): FormSubmitter {
  return {
    async submit(body, signal) {
      const response = await fetch(endpoint, { method: 'POST', body, signal });
      if (!response.ok) return { ok: false };
      const data = (await response.json()) as Web3FormsResponse;
      return { ok: data.success === true };
    },
  };
}
