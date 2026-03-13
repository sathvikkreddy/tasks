import { api } from "@/lib/axios";
import type { ApiSuccessResponse, PaginatedResult } from "@workspace/shared";
import type { AxiosRequestConfig } from "axios";

export const get = async <T, Q=any>(url: string, opts?: QueryTypedAxiosConfig<Q>): Promise<PaginatedResult<T>> => {
    const { data: response } = await api.get<ApiSuccessResponse<PaginatedResult<T>>>(url, opts);
    return response.data;
};

export const getOne = async <T>(url: string, id: string, opts?: AxiosRequestConfig): Promise<T> => {
    const { data: response } = await api.get<ApiSuccessResponse<T>>(`${url}/${id}`, opts);
    return response.data;
};

export const post = async <R, T>(url: string, data: R, opts?: AxiosRequestConfig): Promise<T> => {
    const { data: response } = await api.post<ApiSuccessResponse<T>>(`${url}`, data, opts);
    return response.data;
};

interface QueryTypedAxiosConfig<Q> extends AxiosRequestConfig {
    params?: Q;
}