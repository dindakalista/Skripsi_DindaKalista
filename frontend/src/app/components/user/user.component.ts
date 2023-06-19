import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, debounce, timer } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import { MatPaginator } from '@angular/material/paginator';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    
    subs = new Subscription();

    dataSource = new MatTableDataSource<any>([]);
    displayedColumns: string[] = ['name', 'email', 'role', 'action'];

    pagination: any = {
        index: 0,
        limit: 20
    };

    filters: any = {
        first_name: null,
        last_name: null
    };

    searchControl = new FormControl(null);
    isLoading: boolean = false;

    constructor(
        private userService: UserService,
        private matSnackbar: MatSnackBar,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.initSearch();
        this.fetchAllUsers();
    }

    ngAfterViewInit() {
        this.initPaginator();    
    }

    initPaginator() {
        const sub = this.paginator.page.subscribe((event) => {
            this.pagination.index = event.pageIndex;
            this.pagination.limit = event.pageSize;
            this.fetchAllUsers();
        });

        this.subs.add(sub);
    }

    resetPaginator() {
        this.pagination.index = 0;
        this.paginator.pageIndex = 0;
    }

    initSearch() {
        const sub = this.searchControl.valueChanges.pipe(debounce(() => timer(200))).subscribe(value => {
            this.filters.first_name = value || null;
            // this.filters.last_name  = value || null;

            this.resetPaginator();
            this.fetchAllUsers();
        });

        this.subs.add(sub);
    }

    resetSearch() {
        this.filters.first_name = null;
        this.filters.last_name  = null;
        this.searchControl.setValue(null, { emitEvent: false });
    }

    refresh() {
        this.resetSearch();
        this.resetPaginator();
        this.fetchAllUsers();
    }

    openDialog(edit: boolean, user?: any) {
        const dialogRef = this.dialog.open(UserDialogComponent, {
            data: { edit, user },
            disableClose: true
        });

        this.subs.add(dialogRef.afterClosed().subscribe((data: any) => {
            if (!data) return;
            this.fetchAllUsers();
        }));
    }

    fetchAllUsers() {
        this.isLoading = true;

        const filters    = this.filters; 
        const pagination = this.pagination;

        const sub = this.userService.getAll(filters, pagination).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.dataSource.data = data.users;
                this.paginator.length = data.total_documents;
            },
            error: (error) => {
                this.isLoading = false;
                this.matSnackbar.open(JSON.stringify(error?.error?.detail) || error.message);
            }
        });

        this.subs.add(sub);
    }

    deleteUser(id: string) {
        const swal = Swal.fire({
            title: 'Delete User',
            text: 'Are you sure want to delete this user?',
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

            const sub = this.userService.delete(id).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.fetchAllUsers();
                },
                error: (error) => {
                    this.isLoading = false;
                    this.matSnackbar.open(JSON.stringify(error?.error?.detail) || error.message);
                }
            });

            this.subs.add(sub);
        });
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
