import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../core/services/profile.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { GetPharmacyProfileResponse } from '../../core/interfaces/profile.interface';
@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
    profileData: GetPharmacyProfileResponse | null = null;
    isLoading = true;

    constructor(
        private readonly profileService: ProfileService,
        private readonly errorHandler: ErrorHandlerService,
        private readonly cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.fetchProfile();
    }

    fetchProfile(): void {
        this.isLoading = true;
        this.profileService.getProfile().subscribe({
            next: (data) => {
                console.log('API Response:', data);
                this.profileData = data;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.isLoading = false;
                this.errorHandler.handleError(err, 'Failed to load profile');
                this.cdr.detectChanges();
            }
        });
    }

    getStatusColor(status: string): string {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    }
}