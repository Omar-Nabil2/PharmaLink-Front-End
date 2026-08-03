export interface CreatePatientAddressRequest {

  addressLine: string;
  city: string;
  governorate: string;
  label?: string | null;
  buildingNumber?: string | null;
  floorNumber?: string | null;
  apartmentNumber?: string | null;
  additionalInstructions?: string | null;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface UpdatePatientAddressRequest {

  addressLine: string;
  city: string;
  governorate: string;
  label?: string | null;
  buildingNumber?: string | null;
  floorNumber?: string | null;
  apartmentNumber?: string | null;
  additionalInstructions?: string | null;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

import { PatientAddress } from './profile.interface';

export interface PatientAddressesResponse {
  value: PatientAddress[];
  isSuccess: boolean;
  isFailure: boolean;
  error: any;
}

export interface PatientAddressResponse {
  value: PatientAddress;
  isSuccess: boolean;
  isFailure: boolean;
  error: any;
}
