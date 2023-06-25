import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { FeatureService } from 'src/app/services/feature.service';
import { IssueService } from 'src/app/services/issue.service';
import { IssueDialogComponent } from './issue-dialog/issue-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2'
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    
    subs = new Subscription();

    dataSource = new MatTableDataSource<any[]>([]);
    displayedColumns: string[] = ['ref', 'description', 'reporter', 'reported_date', 'due_date', 'dev_type', 'severity', 'status', 'dev', 'dev_eta', 'dev_actual', 'qa', 'qa_eta', 'qa_actual', 'action'];

    pagination: any = {
        index: 0,
        limit: 20
    };

    filters: any = {
        name: null
    };
    
    currentUser: any;
    isAdmin: Boolean = false;
    features: any[] = [];
    selectedFeatureId: string = '';
    isLoading: boolean = false;

    constructor(
        private featureService: FeatureService,
        private issueService: IssueService,
        private authService: AuthService,
        private dialog: MatDialog,
        private matSnackBar: MatSnackBar,
    ) { }

    ngOnInit() {
        this.currentUser = this.authService.getData().user;
        this.isAdmin = this.currentUser?.role == 'ADMIN';
        this.fetchAllFeatures();
    }

    ngAfterViewInit() {
        this.initPaginator();    
    }

    initPaginator() {
        const sub = this.paginator.page.subscribe((event) => {
            this.pagination.index = event.pageIndex;
            this.pagination.limit = event.pageSize;
            this.fetchAllIssues();
        });

        this.subs.add(sub);
    }

    resetPaginator() {
        this.pagination.index = 0;
        this.paginator.pageIndex = 0;
    }

    refresh() {
        this.resetPaginator();
        this.fetchAllIssues();
    }

    fetchAllFeatures() {
        this.isLoading = true;

        const sub = this.featureService.getAll({}, { limit: 1000 }).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.features = data.features;

                if (!this.isAdmin) {
                    this.features = this.features.filter((item: any) => {
                        return this.currentUser?.feature_ids?.includes(item?._id);
                    });
                }

                this.selectedFeatureId = this.features[0]._id;
                this.fetchAllIssues();
            },
            error: error => {
                this.isLoading = false;
                this.matSnackBar.open(JSON.stringify(error.error.detail) || error.message);
            }
        })

        this.subs.add(sub);
    }

    fetchAllIssues() {
        this.isLoading = true;

        const filters = {};
        const featureId = this.selectedFeatureId;
        const pagination = this.pagination;

        const sub = this.issueService.getAll(featureId, filters, pagination).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.paginator.length = data.total_documents;
                this.dataSource.data = data.issues;
            },
            error: error => {
                this.isLoading = false;
                this.matSnackBar.open(JSON.stringify(error.error.detail) || error.message);
            }
        });

        this.subs.add(sub);
    }

    openIssueDialog(edit: boolean, issue?: any) {
        const dialogRef = this.dialog.open(IssueDialogComponent, {
            data: { feature_id: this.selectedFeatureId, edit, issue },
            disableClose: true
        });

        this.subs.add(dialogRef.afterClosed().subscribe(data => {
            if (!data) return;
            this.fetchAllIssues();
        }));
    }

    deleteFeature(id: string) {
        const swal = Swal.fire({
            title: 'Delete Issue',
            text: 'Are you sure want to delete this issue?',
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
            const sub = this.issueService.delete(id).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.fetchAllIssues();
                },
                error: (error) => {
                    this.isLoading = false;
                    this.matSnackBar.open(JSON.stringify(error?.error?.detail) || error.message);
                }
            });

            this.subs.add(sub);
        });
    }

    changeSelectedFeatureId(event: any) {
        this.selectedFeatureId = event.value;
        this.fetchAllIssues();
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
