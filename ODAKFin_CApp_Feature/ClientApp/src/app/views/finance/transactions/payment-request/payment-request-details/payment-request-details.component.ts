import { Table } from './../../../../../model/financeModule/credit';
import { data } from 'jquery';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { PaginationService } from 'src/app/pagination.service';
import * as paymentRequesType from './payment.model';
import { CommonService } from 'src/app/services/common.service';
import { PaymentRequestService } from 'src/app/services/financeModule/payment-request.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { Globals } from 'src/app/globals';
import { DataService } from 'src/app/services/data.service';
import { AutoCodeService } from 'src/app/services/auto-code.service';
import { rejects } from 'assert';

@Component({
  selector: 'app-payment-request-details',
  templateUrl: './payment-request-details.component.html',
  styleUrls: ['./payment-request-details.component.css']
})

export class PaymentRequestDetailsComponent implements OnInit {
  entityDateFormat = this.commonService.getLocalStorageEntityConfigurable('DateFormat');
  @ViewChild('closeBtn') closeBtn: ElementRef;
  // * pagination start
  pager: any = {};// pager object  
  pagedItems: any = [];// paged items
  filterForm: FormGroup;
  // * pagination end  
  minDate: string = this.datePipe.transform(new Date(),  "yyyy-MM-dd");
  ModifiedOn: any;
  CreatedOn: any;
  private serviceCalled = false;
  CreatedBy: any;
  loginUsername = localStorage.getItem("UserName");
  documentInfo = [];
  allInvoices = [];
  selectedInvoices = [];
  divisionList = [];
  officeList = [];
  vendarList = [];
  requestStatus = [];
  isChecked :boolean = true;
  requesterTypeList = [];
  priorityRequest = [];
  AllDropdown = [];
  paymentRequestId: number;
  paymentRequestForm: FormGroup;
  userId = localStorage.getItem('UserID');
  isAgainstInvoice: any;
  paymentModeList: any;
  currencyList: any;
  entityCurrencyName: any;
  Currency = '';
  autoGenerateCodeList: any = [];
  IsCheck:boolean =  false;
  isUpdate = false;
  paymentAutoGeneratedDetails: any;
  paymentRequesType = paymentRequesType;
  isEditMode = true;
  IsFinal = false;
  deleteInvoice: any;
  UpdatedBy: any;
  currentDate = this.datePipe.transform(new Date(), "dd-MM-yyyy | HH:MM:SS");

  constructor(
    private ps: PaginationService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public commonService: CommonService,
    private paymentRequestService: PaymentRequestService,
    private router: Router,
    private datePipe: DatePipe,
    private globals: Globals,
    private dataService: DataService,
    private autoCodeService: AutoCodeService,
  ) { }

  ngOnInit(): void {
    this.isChecked = false;
    this.route.params.subscribe((params) => {
      this.paymentRequestId = +params['paymentRequestId'] ?   +params['paymentRequestId'] : 0;
      if(this.paymentRequestId){
        this.isUpdate = true;
        this.getById();
        this.paymentRequestForm.disable();
        this.isEditMode = false;
      } else {
        this.isUpdate = false;
      }
    });
    this.createForm();
    this.getDivision();
    this.CustomerList();
    this.getCurrency();
    this.getAllDropdown();
    // this.getAgentInvoice();
    this.getNumberRange();
    

   
    //  set the currency name
    let entityInfo = this.commonService.getLocalStorageEntityConfigurable();
    this.entityCurrencyName = entityInfo['Currency'];
    let currencyValue = this.entityCurrencyName.split('-')[1];
    currencyValue = currencyValue.replace(/^\s+/g, '');
    this.Currency =  currencyValue;
    // console.log('entityCurrencyName', this.Currency)
  }

  getById(){
    const payload = {
      "PaymentRequestId" : this.paymentRequestId
    };

    this.paymentRequestService.GetPaymentRequestById(payload).subscribe((result) => {
      if (result.message == 'Success') {
        const response = result.data;
        const responseTable = result.data.Table;
        // Patch the form with the extracted data
        // "IsSelect": [0],
      
      this.paymentRequestForm.patchValue({
        PaymentRequestId: responseTable[0].PaymentRequestId,
        PRNumber: responseTable[0].PRNumber,
        RequestDateAndTime: this.datePipe.transform( responseTable[0].RequestDateAndTime, "dd-MM-yyyy | HH:MM:SS"),
        DivisionId: responseTable[0].DivisionId,
        OfficeId: responseTable[0].OfficeId,
        VendorId: responseTable[0].VendorId,
        Requester: responseTable[0].Requester,
        RequestType: responseTable[0].RequestType,
        Amount: responseTable[0].Amount,
        PaymentModeId: responseTable[0].PaymentModeId,
        RequestPriorityId: responseTable[0].RequestPriorityId,
        RequestRemarks: responseTable[0].RequestRemarks,
        RequestRejectionRemarks: responseTable[0].RequestRejectionRemarks,
        CreatedBy: responseTable[0].CreatedBy,
        IsAgainstInvoice: responseTable[0].IsAgainstInvoice,
        IsAdvance: responseTable[0].IsAdvance,
        StatusId: responseTable[0].StatusId
      });

      // get Invoice details
      this.selectedInvoices = response.Table1;

      // get Document details

      this.documentInfo = response.Table2;

      // show invoice details
      const paymentRequestForm = this.paymentRequestForm.value;
      if(paymentRequestForm.IsAgainstInvoice){
        this.isAgainstInvoice = true;
      }

      // update 
      this.CreatedOn = responseTable[0].CreatedDate;
      this.ModifiedOn = responseTable[0].UpdatedDate;
      this.CreatedBy = responseTable[0].CreatedByName;
      this.UpdatedBy = responseTable[0].UpdatedByName;
      }
    });
  }


  getDivision() {
    return new Promise((resolve, rejects) => {
      this.commonService.getDivision({}).subscribe((result: any) => {
        this.divisionList = [];
        if (result.data.Table.length > 0) {
          this.divisionList = result.data.Table;
          resolve(true);
        }
      }, error => { 
        rejects(true);
      });;
    });
  }

  getOfficeList(DivisionId) {
    return new Promise((resolve, rejects) => {
      const payload = { DivisionId };
      this.commonService.getOfficeByDivisionId(payload).subscribe((result: any) => {
        this.officeList = [];
        // this.FinancialForm.controls.OfficeId.setValue('');
        if (result.message == 'Success') {
          if (result.data && result.data.Table.length > 0) {
            this.officeList.push(...result.data.Table);
            resolve(true);
          }
        }
      }, error => {
        rejects();
      });
    });
  }

  getAllDropdown(){
    this.paymentRequestService.getDropdown({}).subscribe((result) => {
      if (result.message == 'Success') {
        const resultData = result.data;
        this.requestStatus = resultData.Table.length ? resultData.Table : [];
        this.paymentModeList = resultData.Table1.length ? resultData.Table1 : [];
        this.priorityRequest = resultData.Table2.length ? resultData.Table2 : [];
        this.requesterTypeList = resultData.Table3.length ? resultData.Table3 : [];
      }
    });
  }


// Define a property to store the last selected vendor ID
lastSelectedVendorId = null;

getAgentInvoice() {
  const Table = this.paymentRequestForm.value;
  if(this.selectedInvoices.length == 0 ){
    this.allInvoices.forEach(item => { 
          item.isChecked = false;
      });
    
  }
  if (!Table.VendorId) {
    Swal.fire('Please Select Vendor To Get Invoice');
    return;
  }

  // Check if the vendor ID has changed
  if (Table.VendorId !== this.lastSelectedVendorId) {
    this.lastSelectedVendorId = Table.VendorId;

    const payload = {   
      "VendorId" : Table.VendorId
    };

    this.paymentRequestService.getPaymentRequestInvoiceList(payload).subscribe((result) => {
      if (result.message == 'Success') {
      this.allInvoices = [];
        this.allInvoices = result.data.Table ? result.data.Table : [];

        this.allInvoices.forEach(item => { 
            item.isChecked = false;
        });
      
      }
    });
  }
}

  // markInvoice(index){
  //   debugger;
  //   this.allInvoices[index].isChecked = !this.allInvoices[index].isChecked;
  // }
  
 
 
deleteInvoiceSelected() {
  
  if (this.deleteInvoice ===  '') {
    return;
  }
  const TotalAmount = this.paymentRequestForm.controls.Amount.value;
  const selectedInvoicesAmount = this.selectedInvoices;
  let currentAmount = TotalAmount;
  let val = selectedInvoicesAmount[this.deleteInvoice];
  currentAmount = Math.abs(val.Amount - currentAmount);

  const selectedInvoices = this.allInvoices.filter(invoice => invoice.isChecked === true);
  if (this.selectedInvoices.length > 0) {
    // const val = this.selectedInvoices[this.deleteInvoice];
    selectedInvoices.forEach(item => {
      if (val && val.PurchaseInvoice === item.PurchaseInvoice) {    
      item.isChecked = false;
      }
    });
  }
  this.selectedInvoices.splice(this.deleteInvoice, 1);
  this.deleteInvoice = '';
 
  this.paymentRequestForm.controls.Amount.setValue(currentAmount);
  return;
  
}
markInvoiceSelected(index){
    this.deleteInvoice = index; 
}

  getSelectedInvoice(){

    const selectedInvoices = this.allInvoices.filter(invoice => invoice.isChecked === true);
   
    const payload = [];
    let totalAmount = 0;
    if(!selectedInvoices.length){
      Swal.fire('Please select Invoice to Add');
      return;
    }
    selectedInvoices.forEach(item => {
      const data = {
        "PaymentRequestInvoiceId":  0,
        "PaymentRequestId": this.paymentRequestId,
        "VINumber": item.VendorInvoice? item.VendorInvoice : '',
        "VIDueDate": item.DueDate ? item.DueDate : new Date(), 
        "JobNo": "121121",
        "JobOutsatanding": "2121",
        "BookingParty": "test",
        "NoOfContainer":0,
        "VesselOrVoyage": "test",
        "Batch": "bcbfg",
        "CreditTerms" : "",
        "IsCheck": "",
        "DueAmount": item.DueAmount,
        "Amount": item.Amount,
        "PurchaseInvoice": item.PurchaseInvoice ? item.PurchaseInvoice: '',
        "CreditDays": item.CreditDays? item.CreditDays : 0,
        "CreditLimit": item.CreditLimit ? item.CreditLimit : 0,
        "Attachment" : item.Attachment ?  item.Attachment : ''
   
      };
      payload.push(data);
        totalAmount += item.DueAmount;

    });
    
    this.paymentRequestForm.controls.Amount.setValue(totalAmount);
    this.selectedInvoices = payload;

    this.closeModal();
  }

  closeModal() {    
    // Close the modal using Bootstrap's modal method
    this.closeBtn.nativeElement.click();
  }
  

  CustomerList() {
    this.commonService.getVendorListDropdown({}).subscribe((result: any) => {
      if (result.message == 'Success') {
        if (result["data"].Table.length > 0) {
          // const vendorData = result['data'].Table.filter(t => t.VendorCode != this.Vendor_Code);
          const vendorData = result['data'].Table;
          this.vendarList = [];
          this.vendarList = [...vendorData];
        }
      }
    });
  }

  getCurrency() {
    const payload = { "currencyId": 0, "countryId": 0 };
    this.paymentRequestService.getCurrencyLists(payload).subscribe(data => {
      this.currencyList = data['data'];
    });
  }

  setRequesterType(event){
    this.paymentRequestForm.controls.Amount.setValue('');
   this.selectedInvoices = [];
      this.isAgainstInvoice = event === "Against Invoice" ? true : false;
      this.paymentRequestForm.controls.IsAgainstInvoice.setValue(this.isAgainstInvoice? 1 : 0);
      this.paymentRequestForm.controls.IsAdvance.setValue(this.isAgainstInvoice? 0 : 1);
     
      if(this.isAgainstInvoice){
        this.paymentRequestForm.controls.Amount.setValue('');
      }
  }

  createForm() {
    this.paymentRequestForm = this.fb.group({
      "PaymentRequestId": [this.paymentRequestId],
      "PRNumber": [''],
      "RequestDateAndTime": [this.currentDate],
      "DivisionId": [],
      "OfficeId": [],
      "VendorId": [],
      "Requester": [this.loginUsername],
      "RequestType": [''],
      "Amount": [],
      "PaymentModeId": [],
      "RequestPriorityId": [],
      "RequestRemarks": [],
      "RequestRejectionRemarks": [],
      // "IsSelect": [0],
      "CreatedBy": [this.userId],
      "IsAgainstInvoice": [0],
      "IsAdvance": [1],
      "StatusId": [8],
      "CompletionDate": ['']
  });
  }

  constructPayload(){
    let Table = this.paymentRequestForm.value;
    Table.RequestDateAndTime = new Date(Table.RequestDateAndTime);
    // let Table1 = []
    // this.selectedInvoices.forEach(item => {
    //   const data = {
    //     "PaymentRequestInvoiceId": item.PaymentRequestInvoiceId ? item.PaymentRequestInvoiceId : 0,
    //     "PaymentRequestId": this.paymentRequestId,
    //     "VINumber": item.VINumber? item.VINumber : '1111',
    //     "VIDueDate": item.VIDueDate ? item.VIDueDate : new Date(),
    //     "JobNo": "121121",
    //     "JobOutsatanding": "2121",
    //     "BookingParty": "test",
    //     "NoOfContainer":0,
    //     "VesselOrVoyage": "test",
    //     "Batch": "bcbfg",
    //     "CreditTerms": "test"
    //   }
    //   Table1.push(data);
    // });
    const payload = {
      "PaymentRequest": {
        "Table": [Table],
        "Table1": [...this.selectedInvoices],
        "Table2": [...this.documentInfo]

        // "Table2": []
        }
    };
    return payload;
  }

   async save(){
    return new Promise(async (resolve, rejects) => {
      const Table = this.paymentRequestForm.value;
      const payload = await this.constructPayload();
  
     // console.log('payload',payload);
      // return;
    
      this.paymentRequestService.SavePaymentRequest(payload).subscribe((result: any) => {
        if (result.message === 'Success') {
        //  console.log(result.data.Message, 'result.data.Message')
          Swal.fire(result.data.Message);
          const paymentRequestId = result.data.Id;
          this.paymentRequestId = paymentRequestId;
          if(!this.isUpdate){
            this.updateAutoGenerated();
          }
          resolve(true);
        } else{
          resolve(false);
        }
      });
    });
  }

  samePage(){
    this.router.navigate(['/views/transactions/payment-request/payment-request-details', {'paymentRequestId':this.paymentRequestId}]);
  }

  viewListPage(){
     this.router.navigate(['/views/transactions/payment-request/payment-request-view']);
      }

  checkValidation(){
    const paymentRequestForm = this.paymentRequestForm.value;
    var validation = "";
    
    if (!paymentRequestForm.PRNumber){
      validation += "<span style='color:red;'>*</span> <span>Auto Generate Code</span></br>";
    }

    if (!paymentRequestForm.RequestDateAndTime) {
      validation += "<span style='color:red;'>*</span> <span>Request Date And Time is Required </span></br>";
    }

    // if (!paymentRequestForm.RequestStatusId) {
    //   validation += "<span style='color:red;'>*</span> <span>Status Required </span></br>"
    // }

    if (!paymentRequestForm.DivisionId) {
      validation += "<span style='color:red;'>*</span> <span>Please Select Division </span></br>";
    }

    if (!paymentRequestForm.OfficeId) {
      validation += "<span style='color:red;'>*</span> <span>Please Select Office </span></br>";
    }

    if (!paymentRequestForm.VendorId) {
      validation += "<span style='color:red;'>*</span> <span>Please Select Vendor Name </span></br>";
    }

    if (!paymentRequestForm.Requester) {
      validation += "<span style='color:red;'>*</span> <span>Requester Name Required </span></br>";
    }

    if (!paymentRequestForm.RequestType) {
      validation += "<span style='color:red;'>*</span> <span>Please Select Request Type </span></br>";
    }

    if (!paymentRequestForm.Amount && !this.isAgainstInvoice) {
      validation += "<span style='color:red;'>*</span> <span>Please Enter Amount</span></br>";
    }

    if (!paymentRequestForm.PaymentModeId) {
      validation += "<span style='color:red;'>*</span> <span>Please Select Payment Mode </span></br>";
    }


    if (!paymentRequestForm.RequestPriorityId) {
      validation += "<span style='color:red;'>*</span> <span>Please Select Request Priority </span></br>";
    }

    
    if (!paymentRequestForm.StatusId) {
      validation += "<span style='color:red;'>*</span> <span>Status Required </span></br>";
    }

    return validation;

  }

  //  * credit save
  confirmFunction(type){
    const validation = this.checkValidation();
    // *  validation check
    if (validation != '') {
      Swal.fire(validation);
      return;
    }

    Swal.fire({
      showCloseButton: true,
      title: '',
      icon: 'question',
      text: `Do you want to save this Details?`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: false,
      allowOutsideClick: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        switch(type){
          case paymentRequesType.SAVE_TYPE:
            await this.save();
            this.samePage();
            break;
          case paymentRequesType.SUBMIT_TYPE:
            this.setSubmitStatus();
            await this.save();
            this.viewListPage();
            break;
          case paymentRequesType.WITHDRAW_REQUEST_TYPE:
            this.confirmWithdrawRequest();
            break;
          // case paymentRequesType.HOLD_PAYMENT_TYPE:
          //   this.setHoldPaymentStatus();
          //   await this.save();
          //   this.viewListPage();
          //   break;

          case paymentRequesType.RELEASE_HOLD_TYPE:
            this.setReleseHoldStatus();
            await this.save();
            this.viewListPage();
            break;
          default:
            break;
        }
      }
    });
  }

  confirmWithdrawRequest(){

    Swal.fire({
      showCloseButton: true,
      title: '',
      icon: 'question',
      text: `Do you want to withdraw request?`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: false,
      allowOutsideClick: false
    }).then(async (result) => {
      if (result.isConfirmed) {
      this.setWithdrawRequestStatus();
      this.save();
      this.viewListPage();
    } else {
      this.samePage(); // Add your else condition here
    }
    });
    
  }

  // setPending Approval
  setSubmitStatus(){
    // ! for now changed the status to "Payment Processed" but it need to be Pending Approval
     this.paymentRequestForm.controls.StatusId.setValue(9); // set status as => Pending Approval
    //this.paymentRequestForm.controls.StatusId.setValue(10);  // set status as => Pending Payment
    // this.paymentRequestForm.controls.StatusId.setValue(12); //  "Payment Processed"
  }

  setWithdrawRequestStatus(){
    this.paymentRequestForm.controls.StatusId.setValue(8); //  "DRAFT" 
  }

  // setHoldPaymentStatus(){
  //   this.paymentRequestForm.controls.StatusId.setValue(11); // "Payment On hold"
  // }

  setReleseHoldStatus(){
    this.paymentRequestForm.controls.StatusId.setValue(12); //  "Payment Processed"
  }

  enableEdit(){
    const userID = localStorage.getItem("UserID");
    const paylod = {
      userID: Number(userID),
      Ref_Application_Id: "4",
      SubfunctionID: 525,
    }
    this.commonService.GetUserPermissionObject(paylod).subscribe(data => {
      if (data.length > 0) {
        console.log("PermissionObject", data);

        if (data[0].SubfunctionID == paylod.SubfunctionID) {

          if (data[0].Update_Opt != 2) {
              Swal.fire('Please Contact Administrator');
          }
          else {
              // if(this.IsFinal){
              //   Swal.fire("Final");
              //   return
              // }
              this.paymentRequestForm.enable();
              this.isEditMode = true;
          }
        }
        else {
          Swal.fire('Please Contact Administrator');
        }
      }
      else {
        Swal.fire('Please Contact Administrator');
      }
    }, err => {
      console.log('errr----->', err.message);
    });
  }

  // common auto code generation and update it.
  //  auto generation code final
  getNumberRange() {
    this.autoCodeService.getNumberRange().then((result) => {
      if(result){
        this.autoGenerateCodeList  = result;
         this.paymentAutoGeneratedDetails = this.autoGenerateCodeList.filter(x => x.ObjectName == "Payment Request");
      }
    });
  }

  async getAutoCodeGeneration() {
    const Table = this.paymentRequestForm.value;
    return new Promise(() => {
      if (!this.isUpdate) {
        const code = this.autoCodeService.autoCodeGeneration('Payment Request', this.paymentAutoGeneratedDetails, this.officeList, this.divisionList, Table.DivisionId, Table.OfficeId);
        code.then((code) => {
          if (!code) {
            Swal.fire('Please create the auto-generation code for Payment Request.');
          }
          else {
            this.paymentRequestForm.controls['PRNumber'].setValue(code);
          }
        });
      }
    });
  }

  updateAutoGenerated() {
    if (this.paymentAutoGeneratedDetails.length > 0) {
      this.autoCodeService.updateAutoGenerated(this.paymentAutoGeneratedDetails).then((result) => {
        if(result === 'Success'){
          console.log('auto code generation updated successfully');
        }
      });
    }
  }

  uploadDocument(event: any) {
    const paymentRequestForm = this.paymentRequestForm.value;
    if (event) {
      this.documentInfo.push({
        PaymentRequestFilesId: 0,
        PaymentRequestId: paymentRequestForm.PaymentRequestId,
        DocumentName: event.DocumentName,
        FilePath: event.FilePath,
        UpdateOn: new Date()
      });
    } 
  }

  // getfileupload(event: number) {
  //   debugger
  //   this.setRequesterType(event);
  //   this.selectedInvoices = [];

  //   this.paymentRequestForm.controls['RequestType'].setValue('');
  //   var service = `${this.globals.APIURL}/PaymentRequest/PaymentRequestFilesList`;
  //   this.dataService.post(service, { VendorId: event }).subscribe((result: any) => {
  //     this.documentInfo = [];
  
  //     if (result.message == 'Success' && result.data.Table.length > 0) {
  //       this.documentInfo = result.data.Table;
  //       const paymentRequestForm = this.paymentRequestForm.value;
  //       const Data = [];
  //       this.documentInfo.forEach(item => {
  //         const Documetlist = {
  //           PaymentRequestFilesId: 0,
  //           PaymentRequestId: paymentRequestForm.PaymentRequestId,
  //           DocumentName: item.DocumentName,
  //           FilePath: item.FilePath,
  //           UpdateOn: item.UpdateOn,
  //         };
  //         Data.push(Documetlist);
  //       });
  //       this.documentInfo = Data;
  //     }
  //   }, error => {});
  // }
   
  deleteDocument(deleteData) {

    if(!this.isEditMode){
      Swal.fire("Please Click Edit Button to Delete");
      return;
    }
    const index = this.documentInfo.findIndex((element) => element.BankAttachmentsID == deleteData.BankAttachmentsID);
    this.documentInfo.splice(index, 1);

  }

}