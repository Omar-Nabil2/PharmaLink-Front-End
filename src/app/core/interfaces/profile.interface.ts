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