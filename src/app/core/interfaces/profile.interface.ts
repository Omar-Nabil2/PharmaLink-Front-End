export interface PharmacyDto {
    pharmacyId: string;
    ownerUserId: string;
    legalName: string;
    licenseNumber: string;
    verificationStatus: string;
}

export interface GetPharmacyProfileResponse {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    administeredPharmacies: PharmacyDto[];
}

export interface UpdatePatientProfileRequest {
    fullName: string;
    phoneNumber: string;
}

export interface UpdatePharmacyProfileRequest {
    fullName: string;
    phoneNumber: string;
}

export interface UpdatePharmacyProfileResponse {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
}

export interface PatientAddress {
    addressId: string;

    addressLine: string;
    city: string;
    governorate: string;
    isDefault: boolean;
    latitude: number;
    longitude: number;
}


export interface PatientProfile {
    patientId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    status: string;
    createdAt: string;
    addresses: PatientAddress[];
}

export interface PatientProfileResponse {
    value: PatientProfile;
    isSuccess: boolean;
    isFailure: boolean;
    error: {
        code: string;
        description: string;
        statusCode: number | null;
    };
}