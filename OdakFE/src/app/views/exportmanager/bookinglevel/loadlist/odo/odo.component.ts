import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BookingMaster } from '../../../../../model/booking';
import { City, Country, Port } from '../../../../../model/common';
import { MyBkgLevel, CommonValues, MyBkgDocs } from '../../../../../model/MyBkgLevel';
import { PaginationService } from '../../../../../pagination.service';
import { BkglevelService } from '../../../../../services/bkglevel.service';
import { BookingService } from '../../../../../services/booking.service';
import { EncrDecrServiceService } from '../../../../../services/encr-decr-service.service';
import { RateapprovalService } from '../../../../../services/rateapproval.service';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-odo',
    templateUrl: './odo.component.html',
    styleUrls: ['./odo.component.css']
})
export class OdoComponent implements OnInit {
    title = 'Booking Level Tasks';
    odoForm: FormGroup;
    BookingID = 0;
    dsPorts: Port[];
    dsDocs: MyBkgDocs[];
    dsOdoAttachments: MyBkgDocs[]
    constructor(private fb: FormBuilder, private bookingservice: BookingService, private titleService: Title, private router: Router, private bks: BkglevelService, public ps: PaginationService, private rs: RateapprovalService, private route: ActivatedRoute, private ES: EncrDecrServiceService,) { }

    ngOnInit() {
        this.titleService.setTitle(this.title);
        var queryString = new Array();
        this.route.queryParams.subscribe(params => {
            var Parameter = this.ES.get(localStorage.getItem("EncKey"), params['encrypted']);
            var KeyPara = Parameter.split(',');
            for (var i = 0; i < KeyPara.length; i++) {
                var key = KeyPara[i].split(':')[0];
                var value = KeyPara[i].split(':')[1];
                queryString[key] = value;
            }
            if (queryString["ID"] != null) {
                //this.oogForm.value.ID = queryString["ID"].toString();
                this.BookingID = queryString["ID"].toString();
            }

        });
        this.createForm();
        this.ViewDocList();
        this.ViewAttachList();
    }
    ViewDocList() {
        this.odoForm.value.ID = this.BookingID;
        this.bks.getOdoHazlist(this.odoForm.value).subscribe(data => {
            this.dsDocs = data;

        });
    }
    ViewAttachList() {
        this.odoForm.value.ID = this.BookingID;
        this.bks.getDocsODOAttachlist(this.odoForm.value).subscribe(data => {
            this.dsOdoAttachments = data;

        });
    }
    createForm() {
        this.odoForm = this.fb.group({
            ID: 0,
            FileName: '',
            AttachFile: '',

        });
    }
    selectedFile: File = null;
    uploadedfile: string = null;
    progress: string = '';

    onFileSelected(event) {
        this.selectedFile = event.target.files[0];
        const filedata = new FormData();
        filedata.append('file', this.selectedFile, this.selectedFile.name)
        this.bks.AttachUpload(this.selectedFile).subscribe(
            (event) => {

                var fullpath = event;
                var res = JSON.stringify(fullpath).split('\\').pop().split('"}')[0]
                this.uploadedfile = res;
                // console.log(this.uploadedfile);

            }
        );

    }
    onSubmit() {
        var validation = "";

        if (this.odoForm.value.FileName == "") {
            validation += "<span style='color:red;'>*</span> <span>Please Enter File Name</span></br>"
        }

        if (this.uploadedfile == null) {
            validation += "<span style='color:red;'>*</span> <span>Please Upload File</span></br>"
        }
        var vtrue = 0;
        for (let item of this.dsDocs) {

            if (item.ChkFlag == 1) {
                vtrue = 1;
            }

        }
        if (vtrue == 0) {
            Swal.fire("Please Check Atleast one");
            return false;
        }
        if (validation != "") {

            Swal.fire(validation)
            return false;
        }
        this.odoForm.value.AttachFile = this.uploadedfile;

        var Items = [];
        for (let item of this.dsDocs) {

            if (item.ChkFlag == 1) {
                Items.push('Insert:' + item.CntrID, item.BLID, item.BkgID
                );
            }

        }

        this.odoForm.value.Items = Items.toString();
        this.bks.BkgDocHAZSave(this.odoForm.value).subscribe(Data => {
            Swal.fire(Data[0].AlertMessage)
            setTimeout(() => {
                //this.router.navigate(['/views/enquiries-booking/rateapprovals/rateapprovalsview/rateapprovalsview']);
            }, 2000);  //5s
        },
            (error: HttpErrorResponse) => {
                Swal.fire(error.message)
            });
    }
    btntabclick(tab) {


        var values = "ID: " + this.BookingID;
        var encrypted = this.ES.set(localStorage.getItem("EncKey"), values);
        if (tab == 1)
            this.router.navigate(['/views/exportmanager/bookinglevel/bookings/bookings'], { queryParams: { encrypted } });
        else if (tab == 2) {
            this.router.navigate(['/views/exportmanager/bookinglevel/containers/containers'], { queryParams: { encrypted } });
        }
        else if (tab == 3) {
            this.router.navigate(['/views/exportmanager/bookinglevel/loadlist/haz/haz'], { queryParams: { encrypted } });
        }
        else if (tab == 4) {
            this.router.navigate(['/views/exportmanager/bookinglevel/bol/bol'], { queryParams: { encrypted } });
        }
        else if (tab == 5) {
            this.router.navigate(['/views/exportmanager/bookinglevel/blrelease/blrelease'], { queryParams: { encrypted } });
        }
        else if (tab == 6) {
            this.router.navigate(['/views/exportmanager/bookinglevel/exphandling/exphandling'], { queryParams: { encrypted } });
        }
        else if (tab == 7) {
            this.router.navigate(['/views/exportmanager/bookinglevel/invoices/invoices'], { queryParams: { encrypted } });
        }
        else if (tab == 8) {
            this.router.navigate(['/views/exportmanager/bookinglevel/attach/attach'], { queryParams: { encrypted } });
        }

    }

    doctab(tab) {



        var values = "ID: " + this.BookingID;
        var encrypted = this.ES.set(localStorage.getItem("EncKey"), values);
        if (tab == 1)
            this.router.navigate(['/views/exportmanager/bookinglevel/loadlist/haz/haz'], { queryParams: { encrypted } });
        else if (tab == 2) {
            this.router.navigate(['/views/exportmanager/bookinglevel/loadlist/oog/oog'], { queryParams: { encrypted } });
        }
        else if (tab == 3) {
            this.router.navigate(['/views/exportmanager/bookinglevel/loadlist/reefer/reefer'], { queryParams: { encrypted } });
        }
        else if (tab == 4) {
            this.router.navigate(['/views/exportmanager/bookinglevel/loadlist/odo/odo'], { queryParams: { encrypted } });
        }

    }
}
