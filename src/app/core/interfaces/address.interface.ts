export interface AddressResponse {
    addressId: string;
    userId: string;
    addressLine: string;
    city: string;
    governorate: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
}