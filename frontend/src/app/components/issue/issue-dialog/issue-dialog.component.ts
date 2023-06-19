import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { FeatureService } from 'src/app/services/feature.service';
import { IssueService } from 'src/app/services/issue.service';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-issue-dialog',
  templateUrl: './issue-dialog.component.html',
  styleUrls: ['./issue-dialog.component.css']
})
export class IssueDialogComponent {
    subs = new Subscription();

    isEdit: boolean = false;
    isLoading: boolean = false;
    minDate: Date = new Date();
    currentUser: any;
    testers: any[] = [];
    developers: any[] = [];
    features: any[] = [];

    devTypes = [
        { value: 'FE', key: 'Front End' },
        { value: 'BE', key: 'Back End'  },
    ];

    statuses = [
        { value: 'OPEN',        key: 'Open' },
        { value: 'IN_PROGRESS', key: 'In Progress' },
        { value: 'DEV_DONE',    key: 'Dev Done' },
        { value: 'FAIL',        key: 'Fail' },
        { value: 'PASS',        key: 'Pass' },
        { value: 'NAB',         key: 'Not A Bug' },
    ];

    severities = [
        { value: 'MAJOR',        key: 'Major' },
        { value: 'MINOR',        key: 'Minor' },
        { value: 'BLOCKING',     key: 'Blocking' },
        { value: 'MODERATE',     key: 'Moderate' },
        { value: 'LOCALIZATION', key: 'Localization' }
    ];

    form: FormGroup = this.formBuilder.group({
        ref           : [null, Validators.required],
        description   : [null, Validators.required],
        severity      : [null, Validators.required],
        feature_id    : [null, Validators.required],
        reporter_id   : [null, Validators.required],
        reported_date : [this.minDate, Validators.required],
        dev_type      : [null],
        due_date      : [null],
        status        : ['OPEN'],
        dev_id        : [null],
        dev_eta       : [null],
        dev_actual    : [null],
        qa_id         : [null],
        qa_eta        : [null],
        qa_actual     : [null]
    });

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialog: MatDialogRef<IssueDialogComponent>,
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private userService: UserService,
        private featureService: FeatureService,
        private issueService: IssueService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.isEdit = this.data.edit;
        this.currentUser = this.authService.getData()?.user;

        if (this.isEdit) {
            this.form.patchValue(this.data.issue);
        } else {
            this.form.get('feature_id')?.setValue(this.data.feature_id);
        }

        if (this.currentUser) {
            this.form.get('reporter_id')?.setValue(this.currentUser._id);
        }

        this.subs.add(this.form.get('reported_date')?.valueChanges.subscribe(value => {
            this.minDate = new Date(value);
        }));

        this.fetchAllUsers();
        this.fetchAllFeatures();
    }

    fetchAllUsers() {
        this.isLoading = true;

        const sub = this.userService.getAll().subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.developers = data.users.filter((item: any) => item.role == 'FE' || item.role == 'BE');
                this.testers = data.users.filter((item: any) => item.role == 'QA');
            },
            error: error => {
                this.isLoading = false;
                this.snackBar.open(JSON.stringify(error.error.detail) || error.message);
            }
        });

        this.subs.add(sub);
    }

    fetchAllFeatures() {
        this.isLoading = true;

        this.subs.add(this.featureService.getAll().subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.features = data.features;
            },
            error: error => {
                this.isLoading = false;
                this.snackBar.open(JSON.stringify(error.error.detail) || error.message);
            }
        }))
    }

    submit() {
        if (this.form.invalid) {
            Object.entries((this.form!.controls)).forEach(([_, control]) => {
                control.markAsTouched()
            });
            return this.form.updateValueAndValidity();
        }

        const value = this.form.value;
        const data  = this.data;
        
        this.isEdit ? this.updateIssue(data.issue?._id, value) : this.createIssue(value);
    }

    createIssue(data: any) {
        this.isLoading = true;

        this.subs.add(this.issueService.create(data).subscribe({
            next: data => {
                this.isLoading = false;
                this.dialog.close(true);
            },
            error: error => {
                this.isLoading = false;
                this.snackBar.open(JSON.stringify(error.error.detail) || error.message);
            }
        }))
    }

    updateIssue(id: string, data: any) {
        this.isLoading = true;

        if (data?.reported_date) {
            data.reported_date = new Date(data.reported_date);
        }

        if (data?.due_date) {
            data.due_date = new Date(data.due_date);
        }

        this.subs.add(this.issueService.update(id, data).subscribe({
            next: data => {
                this.isLoading = false;
                this.dialog.close(true);
            },
            error: error => {
                this.isLoading = false;
                this.snackBar.open(JSON.stringify(error.error.detail) || error.message);
            }
        }))
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
