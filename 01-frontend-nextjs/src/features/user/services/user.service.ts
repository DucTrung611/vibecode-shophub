import { apiClient } from "../../../shared/services/api-client";
import type { ApiResult } from "../../../shared/types/api-response.types";
import type {
  Address,
  CreateAddressInput,
  Profile,
  UpdateProfileInput,
} from "../types/user.types";

export async function getProfile(): Promise<Profile> {
  const result = (await apiClient.get("/users/me")) as unknown as ApiResult<Profile>;
  return result.data;
}

export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  const result = (await apiClient.patch(
    "/users/me",
    input,
  )) as unknown as ApiResult<Profile>;
  return result.data;
}

export async function getAddresses(): Promise<Address[]> {
  const result = (await apiClient.get(
    "/users/me/addresses",
  )) as unknown as ApiResult<Address[]>;
  return result.data;
}

export async function createAddress(input: CreateAddressInput): Promise<Address> {
  const result = (await apiClient.post(
    "/users/me/addresses",
    input,
  )) as unknown as ApiResult<Address>;
  return result.data;
}
