
import {
  API_CONFIG,
  ERROR_MESSAGES,
  logRequest,
  logResponse,
} from "./config";

export class APIError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(statusCode: number, message: string, data?: unknown) {
    super(message);
    this.name = "APIError";

    this.statusCode = statusCode;
    this.data = data;
  }
}


interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  data?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

export class HttpClient {
  private baseURL: string;
  private headers: Record<string, string>;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.headers = API_CONFIG.HEADERS;
    this.timeout = API_CONFIG.TIMEOUT;
  }


  setAuthToken(token: string) {
    this.headers["Authorization"] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.headers["Authorization"];
  }

  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    // Normalizar endpoint: remover barra inicial se existir
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Garantir que baseURL termina com /
    const base = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
    
    // Combinar baseURL + endpoint
    const fullPath = `${base}${normalizedEndpoint}`;
    
    const url = new URL(fullPath);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  private async request<T>(options: RequestOptions): Promise<T> {
    const { method, endpoint, data, headers = {}, params } = options;
    const url = this.buildURL(endpoint, params);

    logRequest(method, url, data);

    // Controller para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.headers,
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Trata erros HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          ERROR_MESSAGES[response.status] ||
          "Erro desconhecido";

        throw new APIError(response.status, errorMessage, errorData);
      }

      // Parse da resposta
      const responseData = await response.json();
      logResponse(url, responseData);

      return responseData as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Erro de timeout
      if (error instanceof Error && error.name === "AbortError") {
        throw new APIError(
          408,
          "Tempo de requisição esgotado. Tente novamente."
        );
      }

      // Erro de rede
      if (error instanceof TypeError) {
        throw new APIError(0, "Erro de conexão. Verifique sua internet.");
      }

      // Re-throw APIError
      if (error instanceof APIError) {
        throw error;
      }

      // Erro desconhecido
      throw new APIError(500, "Erro inesperado. Tente novamente.");
    }
  }


  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>({
      method: "GET",
      endpoint,
      params,
    });
  }

  
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>({
      method: "POST",
      endpoint,
      data,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>({
      method: "PUT",
      endpoint,
      data,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>({
      method: "PATCH",
      endpoint,
      data,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>({
      method: "DELETE",
      endpoint,
    });
  }
}

export const httpClient = new HttpClient();

export const handleAPIError = (error: unknown): string => {
  if (error instanceof APIError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro desconhecido";
};
