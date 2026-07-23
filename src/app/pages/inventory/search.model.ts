export interface MedicineSearchDTO {
  id: string;
  name: string;
  genericName?: string;
  arabicName: string;
  strength?: string;
  dosageForm?: string;
  route?: string;
  category?: string;
  company?: string;
  price?: number;
}

export interface PharmacyBranchSearchDTO {
  branchId: string;
  pharmacyId: string;
  branchName: string;
  addressLine: string;
}
