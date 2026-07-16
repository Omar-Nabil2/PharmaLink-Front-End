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