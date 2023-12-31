import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, debounce, timer } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FeatureService } from 'src/app/services/feature.service';
import { FeatureDialogComponent } from './feature-dialog/feature-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-feature',
    templateUrl: './feature.component.html',
    styleUrls: ['./feature.component.css']
})
export class FeatureComponent {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    
    subs = new Subscription();

    dataSource = new MatTableDataSource<any>([]);
    displayedColumns = ['name', 'action'];

    pagination: any = {
        index: 0,
        limit: 20
    };

    filters: any = {
        name: null
    };

    sort: any = {
        field: 'name',
        direction: 'asc'
    };

    searchControl = new FormControl(null);
    isLoading: boolean = false;

    constructor(
        private featureService: FeatureService,
        private matSnackbar: MatSnackBar,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.initSearch();
        this.fetchAllFeatures();
    }

    ngAfterViewInit() {
        this.initPaginator();    
    }

    initPaginator() {
        const sub = this.paginator.page.subscribe((event) => {
            this.pagination.index = event.pageIndex;
            this.pagination.limit = event.pageSize;
            this.fetchAllFeatures();
        });

        this.subs.add(sub);
    }

    resetPaginator() {
        this.pagination.index = 0;
        this.paginator.pageIndex = 0;
    }

    initSearch() {
        const sub = this.searchControl.valueChanges.pipe(debounce(() => timer(200))).subscribe(value => {
            this.filters.name = value || null;
            this.resetPaginator();
            this.fetchAllFeatures();
        });

        this.subs.add(sub);
    }

    resetSearch() {
        this.filters.name = null;
        this.searchControl.setValue(null, { emitEvent: false });
    }

    refresh() {
        this.resetSearch();
        this.resetPaginator();
        this.fetchAllFeatures();
    }

    openDialog(edit: boolean, feature?: any) {
        const dialogRef = this.dialog.open(FeatureDialogComponent, {
            data: { edit, feature },
            disableClose: true
        });

        this.subs.add(dialogRef.afterClosed().subscribe((data: any) => {
            if (!data) return;
            this.fetchAllFeatures();
        }));
    }

    fetchAllFeatures() {
        this.isLoading = true;

        const filters    = this.filters; 
        const pagination = this.pagination;
        const sort = this.sort;

        const sub = this.featureService.getAll(filters, pagination, sort).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.dataSource.data = data.features;
                this.paginator.length = data.total_documents;
            },
            error: (error) => {
                this.isLoading = false;
                this.matSnackbar.open(error?.error?.detail || error.message);
            }
        });

        this.subs.add(sub);
    }

    deleteFeature(id: string) {
        const swal = Swal.fire({
            title: 'Delete Feature',
            text: 'Are you sure want to delete this feature?',
            icon: 'warning',
            confirmButtonText: 'Delete',
            confirmButtonColor: '#f44336',
            showCancelButton: true,
            allowOutsideClick: false,
            cancelButtonText: 'Cancel'
        })

        swal.then(({ isConfirmed }) => {
            if (!isConfirmed) return;

            this.isLoading = true;
            const sub = this.featureService.delete(id).subscribe({
                next: (data: any) => {
                    this.isLoading = false;
                    this.matSnackbar.open(data?.detail || '');
                    this.fetchAllFeatures();
                },
                error: (error) => {
                    this.isLoading = false;
                    this.matSnackbar.open(error?.error?.detail || error.message);
                }
            });

            this.subs.add(sub);
        });
    }

    onSortDataChange(event: any) {
        this.sort.direction = event.direction || 'asc';
        this.fetchAllFeatures();
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
