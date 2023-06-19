import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { FeatureService } from 'src/app/services/feature.service';
import { IssueService } from 'src/app/services/issue.service';
import { IssueDialogComponent } from './issue-dialog/issue-dialog.component';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent {
    subs = new Subscription();

    dataSource = new MatTableDataSource<any[]>([]);
    displayedColumns: string[] = ['ref', 'description', 'reporter', 'reported_date', 'due_date', 'dev_type', 'severity', 'status', 'action'];

    features: any[] = [];
    selectedFeatureId: string = '';
    isLoading: boolean = false;

    constructor(
        private featureService: FeatureService,
        private issueService: IssueService,
        private dialog: MatDialog,
        private matSnackBar: MatSnackBar,
    ) { }

    ngOnInit() {
        this.fetchAllFeatures();
    }

    fetchAllFeatures() {
        this.isLoading = true;

        const sub = this.featureService.getAll().subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.features = data.features;
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

        const filters = {
            feature_id: this.selectedFeatureId
        };

        const sub = this.issueService.getAll(filters).subscribe({
            next: (data: any) => {
                this.isLoading = false;
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
