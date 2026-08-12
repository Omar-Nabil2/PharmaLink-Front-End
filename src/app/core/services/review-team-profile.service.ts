import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface ReviewTeamProfile {
  fullName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}

export interface UpdateReviewTeamProfileDto {
  fullName: string;
  phoneNumber?: string;
}

export interface ProfilePictureResponseDto {
  profilePictureUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewTeamProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/ReviewTeamProfile`;

  getProfile(): Observable<ReviewTeamProfile> {
    return this.http.get<ReviewTeamProfile>(this.baseUrl);
  }

  updateProfile(data: UpdateReviewTeamProfileDto): Observable<ReviewTeamProfile> {
    return this.http.put<ReviewTeamProfile>(this.baseUrl, data);
  }

  uploadProfilePicture(file: File): Observable<ProfilePictureResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<ProfilePictureResponseDto>(`${this.baseUrl}/picture`, formData);
  }

  getProfilePicture(): Observable<ProfilePictureResponseDto> {
    return this.http.get<ProfilePictureResponseDto>(`${this.baseUrl}/picture`);
  }
}
