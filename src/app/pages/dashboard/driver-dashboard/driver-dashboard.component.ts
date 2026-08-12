import { Component, OnInit, OnDestroy, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api'; // لاستخدام Toast للإشعارات
import { ToastModule } from 'primeng/toast';
import { DriverService, DeliveryJobNotification } from '@core/services/driver.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-driver-dashboard',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, TagModule, ToastModule],
    providers: [MessageService], // ضروري لـ Toast PrimeNG
    templateUrl: './driver-dashboard.component.html',
})
export class DriverDashboardComponent implements OnInit, OnDestroy {
    private driverService = inject(DriverService);
    private messageService = inject(MessageService);
    private platformId = inject(PLATFORM_ID);
    
    // Map variables
    private map: any;
    private routingControl: any;


    // استخدام Signals
    availableJobs = signal<DeliveryJobNotification[]>([]);
    activeJob = signal<DeliveryJobNotification | null>(null);
    isLoading = signal<boolean>(false);

    private subs = new Subscription();

    ngOnInit() {
        const token = localStorage.getItem('token') || '';
        this.driverService.startConnection(token);

        // 1. Check for Active Job First
        this.isLoading.set(true);
        this.driverService.getActiveJob().subscribe({
            next: (active) => {
                this.isLoading.set(false);
                if (active) {
                    this.activeJob.set(active);
                    this.initMap(active);
                } else {
                    this.loadInitialJobsWithLocation();
                }
            },
            error: (err) => {
                this.isLoading.set(false);
                this.loadInitialJobsWithLocation();
            }
        });

        // ==========================================
        // 2. استقبال الطلبات الجديدة عبر SignalR (زي ما هي بالظبط)
        // ==========================================
        this.subs.add(
            this.driverService.newJobReceived$.subscribe((job) => {
                if (!this.activeJob()) {
                    if (this.availableJobs().some(j => j.jobId === job.jobId)) return;

                    const incomingJob = { ...job, isCalculatingDistance: true };
                    this.availableJobs.update(jobs => [...jobs, incomingJob]);
                    this.messageService.add({ severity: 'info', summary: 'طلب جديد!', detail: `توصيلة جديدة من ${incomingJob.pharmacyName}` });

                    if (navigator.geolocation && incomingJob.pharmacyLatitude && incomingJob.pharmacyLongitude) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                const driverLat = position.coords.latitude;
                                const driverLng = position.coords.longitude;

                                const driverToPharmacyKm = this.calculateDistanceKm(driverLat, driverLng, incomingJob.pharmacyLatitude!, incomingJob.pharmacyLongitude!);
                                const totalDistance = driverToPharmacyKm + incomingJob.distanceKm;

                                this.availableJobs.update(jobs => jobs.map(j =>
                                    j.jobId === incomingJob.jobId
                                        ? { ...j, distanceKm: Number(totalDistance.toFixed(2)), isCalculatingDistance: false }
                                        : j
                                ));
                            },
                            (error) => {
                                this.availableJobs.update(jobs => jobs.map(j => j.jobId === incomingJob.jobId ? { ...j, isCalculatingDistance: false } : j));
                            },
                            { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
                        );
                    } else {
                        this.availableJobs.update(jobs => jobs.map(j => j.jobId === incomingJob.jobId ? { ...j, isCalculatingDistance: false } : j));
                    }
                }
            })
        );
    }


    private loadInitialJobsWithLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.loadInitialJobs(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    this.loadInitialJobs(null, null);
                },
                { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
            );
        } else {
            this.loadInitialJobs(null, null);
        }
    }

    private async initMap(job: DeliveryJobNotification) {
        if (!isPlatformBrowser(this.platformId)) return;
        
        try {
            const L = await import('leaflet');
            await import('leaflet-routing-machine');

            // Wait a tick for DOM to render the map container
            setTimeout(() => {
                const mapContainer = document.getElementById('driver-map');
                if (!mapContainer) return;
                
                if (this.map) {
                    this.map.remove();
                }

                // Default center to pharmacy or driver
                const centerLat = job.pharmacyLatitude || 30.0444;
                const centerLng = job.pharmacyLongitude || 31.2357;

                this.map = L.map('driver-map').setView([centerLat, centerLng], 13);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(this.map);

                // Add Routing if we have driver location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        const driverLat = pos.coords.latitude;
                        const driverLng = pos.coords.longitude;
                        
                        // Custom icon for Driver
                        const driverIcon = L.icon({
                            iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204987.png',
                            iconSize: [38, 38]
                        });
                        
                        // Custom icon for Pharmacy/Customer
                        const locationIcon = L.icon({
                            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                            iconSize: [38, 38]
                        });

                        const waypoints = [
                            L.latLng(driverLat, driverLng),
                            L.latLng(job.pharmacyLatitude || centerLat, job.pharmacyLongitude || centerLng),
                            L.latLng(job.latitude || centerLat, job.longitude || centerLng)
                        ];

                        this.routingControl = (L as any).Routing.control({
                            waypoints: waypoints,
                            routeWhileDragging: false,
                            addWaypoints: false,
                            show: false, // hide the detailed turn-by-turn text box to save space
                            createMarker: (i: number, waypoint: any, n: number) => {
                                const isDriver = i === 0;
                                return L.marker(waypoint.latLng, {
                                    icon: isDriver ? driverIcon : locationIcon
                                });
                            }
                        }).addTo(this.map);
                    });
                }
            }, 100);
        } catch (e) {
            console.error('Failed to load map', e);
        }
    }

    // ==========================================
    // دالة مساعدة لجلب الطلبات ومعالجتها فوراً
    // ==========================================
    private loadInitialJobs(driverLat: number | null, driverLng: number | null) {
        this.driverService.getAvailableJobs(driverLat, driverLng).subscribe({
            next: (jobs) => {
                if (jobs && jobs.length > 0) {

                    // لو معانا موقع الطيار، هنجمع المسافات فوراً من غير لودر
                    if (driverLat !== null && driverLng !== null) {
                        const updatedJobs = jobs.map(job => {
                            if (job.pharmacyLatitude && job.pharmacyLongitude) {
                                const driverToPharmacyKm = this.calculateDistanceKm(
                                    driverLat, driverLng,
                                    job.pharmacyLatitude, job.pharmacyLongitude
                                );
                                const totalDistance = driverToPharmacyKm + job.distanceKm;

                                return { ...job, distanceKm: Number(totalDistance.toFixed(2)), isCalculatingDistance: false };
                            }
                            return { ...job, isCalculatingDistance: false };
                        });
                        this.availableJobs.set(updatedJobs);
                    } else {
                        // لو مفيش GPS شغال
                        this.availableJobs.set(jobs.map(j => ({ ...j, isCalculatingDistance: false })));
                    }
                }
            }
        });
    }

    acceptJob(job: DeliveryJobNotification) {
        this.isLoading.set(true);
        this.driverService.acceptJob(job.jobId).subscribe({
            next: () => {
                this.activeJob.set(job);
                this.availableJobs.set([]); // تفريغ باقي الطلبات
                this.isLoading.set(false);
                this.messageService.add({ severity: 'success', summary: 'تم القبول', detail: 'تم قبول الطلب بنجاح، توجه للصيدلية!' });
                this.initMap(job);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.messageService.add({ severity: 'error', summary: 'عفواً', detail: 'تم سحب الطلب من طيار آخر' });
                this.availableJobs.update(jobs => jobs.filter(j => j.jobId !== job.jobId));
            }
        });
    }

    openGoogleMaps(job: DeliveryJobNotification) {
        let destination = ''; // وجهة النهاية (العميل)
        let waypoint = '';    // محطة التوقف (الصيدلية)

        // 1. تحديد موقع العميل (الوجهة النهائية)
        if (job.latitude && job.longitude) {
            destination = `${job.latitude},${job.longitude}`;
        } else if (job.fullAddress) {
            destination = encodeURIComponent(job.fullAddress);
        }

        // 2. تحديد موقع الصيدلية (محطة الاستلام)
        if (job.pharmacyLatitude && job.pharmacyLongitude) {
            waypoint = `${job.pharmacyLatitude},${job.pharmacyLongitude}`;
        }

        if (destination) {
            // بناء رابط جوجل مابس
            // api=1: إجباري لاستخدام الـ API
            // destination: الوجهة النهائية (العميل)
            let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

            // لو عندنا إحداثيات الصيدلية، بنضيفها كـ waypoint (نقطة توقف في النص)
            // جوجل تلقائياً هياخد "موقع الطيار الحالي" كـ origin
            if (waypoint) {
                url += `&waypoints=${waypoint}`;
            }

            // فتح الخريطة
            window.open(url, '_blank');
        } else {
            this.messageService.add({ severity: 'warn', summary: 'عفواً', detail: 'لا يوجد عنوان أو إحداثيات صالحة لهذا الطلب.' });
        }
    }

    completeJob() {
        const job = this.activeJob();
        if (!job) return;

        this.isLoading.set(true);
        this.driverService.completeJob(job.jobId).subscribe({
            next: () => {
                this.activeJob.set(null);
                this.isLoading.set(false);
                if (this.map) {
                    this.map.remove();
                    this.map = null;
                }
                this.messageService.add({ severity: 'success', summary: 'تم التسليم', detail: 'تم إنهاء الطلب بنجاح، أنت متاح الآن.' });
                this.loadInitialJobsWithLocation();
            },
            error: () => {
                this.isLoading.set(false);
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء إنهاء الطلب' });
            }
        });
    }

    // دالة لحساب المسافة بالكيلومتر بين نقطتين
    private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // نصف قطر الأرض بالكيلومتر
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(value: number): number {
        return value * Math.PI / 180;
    }




    ngOnDestroy() {
        this.driverService.stopConnection();
        this.subs.unsubscribe();
    }
}