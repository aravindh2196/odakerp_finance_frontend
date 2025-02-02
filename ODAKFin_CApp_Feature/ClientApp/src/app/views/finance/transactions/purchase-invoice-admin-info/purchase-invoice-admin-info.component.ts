import { TDSRate } from 'src/app/model/financeModule/TDS';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Globals } from 'src/app/globals';
import { CommonService } from 'src/app/services/common.service';
import { DataService } from 'src/app/services/data.service';
import { PaymentVoucherService } from 'src/app/services/payment-voucher.service';
import Swal from 'sweetalert2';
import { VendorService } from 'src/app/services/financeModule/vendor.service';
import { DatePipe } from '@angular/common';
import { TDSService } from 'src/app/services/financeModule/tds.service';
import { ChartaccountService } from 'src/app/services/financeModule/chartaccount.service';
import { PaginationService } from 'src/app/pagination.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AutoCodeService } from 'src/app/services/auto-code.service';
import { TaxgroupService } from 'src/app/services/taxgroup.service';
import { rejects } from 'assert';
import { resolve } from 'dns';

@Component({
  selector: 'app-purchase-invoice-admin-info',
  templateUrl: './purchase-invoice-admin-info.component.html',
  styleUrls: ['./purchase-invoice-admin-info.component.css'],
  providers: [DatePipe]
})
export class PurchaseInvoiceAdminInfoComponent implements OnInit {
  minDate: string = this.datePipe.transform(new Date(), "yyyy-MM-dd");
  // newOne : string = '';
  isUpdate: boolean = false;
  isUpdateMode: boolean = false;
  isUpdateMode1: boolean = false;
  ModifiedOn: string = '';
  ModifiedBy: string = '';
  CreatedOn: string = '';
  CreatedBy: string = '';
  PurchaseCreateForm: FormGroup;
  private ngUnsubscribe = new Subject<void>();
  vendorBranch: any = [];
  maxDate: string = this.datePipe.transform(new Date(), "yyyy-MM-dd");
  DueDateopen : string = this.datePipe.transform(new Date(), "yyyy-MM-dd");
  TDSApplicability = [{ name: 'Yes', id: 1 }, { name: 'No', id: 2 }, { name: 'LDC', id: 3 }];
  entityDateFormat = this.commonDataService.getLocalStorageEntityConfigurable('DateFormat');
  GSTCategoryList: any = [];
  FileList: any = [];
  divisionList: any = [];
  officeList: any = [];
  statusList: any = [];
  vendorsList: any = [];
  tdsSectionData: any = [];
  reasonList: any = [];
  purchaseList: any = [];
  duedatelist: any = [];
  internalOderList: any = [];
  accountName: any = [];
  currencyList: any = [];
  isEditMode: boolean = false;
  PurchaseInvoiceId: number = 0;
  PurchaseTableList: any = [];
  editSelectedIdex: any;
  pager: any = {};
  pagedItems: any = [];
  payload: any = {};
  autoGenerateCodeList: any = [];
  isFinalRecord: boolean = false;
  entityCurrencyID: any;
  taxList: any = [];
  officeCityId: any;
  entityCurrencyName: string = '';
  orderType: string = '';
  duedate: any[];
  PIDate: any;
  vendorBranchId: number = 0;
  vendorTDS = 0;
  vendorLDC : any;
  ModuleId: any
  modules: any;
  moduleName = 'Purchase invoice(Admin)'
  mappingSuccess: boolean = false;
  errorMessage: any;

  constructor(
    private fb: FormBuilder,
    private globals: Globals,
    private datePipe: DatePipe,
    private dataService: DataService,
    public commonDataService: CommonService,
    private VendorService: VendorService,
    private tdsService: TDSService,
    public ps: PaginationService,
    private router: Router,
    private route: ActivatedRoute,
    private autoCodeService: AutoCodeService,
    private chartAccountService: ChartaccountService,
    private paymentService: PaymentVoucherService,
    private ms: TaxgroupService
  ) { }

  ngOnInit() {
    this.createPurchaseInvoiceForm();
    this.getDivisionList();
    this.getStatus();
    this.getVendorList();
    this.GetGSTCategory();
    this.getTDSSection();
    this.getReasonList();
    this.getPurchaseList();
    this.getInternalOrderList();
    this.ChartAccountList();
    this.getCurrency();
    this.getNumberRange();
    this.getTaxGroup();

   


  // this.maxDate = new Date();
  // this.maxDate.setDate( this.maxDate.getDate() + 3 );

    

    this.route.params.subscribe(param => {
      if (param.id) {
        this.PurchaseInvoiceId = param.id;
        this.isUpdate = true;
        this.isUpdateMode = true;
        this.isUpdateMode1 = false;
        this.getPurchaseInvoiceAdminInfo();
        this.PurchaseCreateForm.disable();
      }
    });
    this.getModuleType( () => {
      if(this.mappingSuccess == false){
        Swal.fire(this.errorMessage)
      }
    });
  }

  updateValue(){
    const userID = localStorage.getItem("UserID");
    const paylod = {
      userID: Number(userID),
      Ref_Application_Id: "4",
      SubfunctionID: 511,
    }
    this.commonDataService.GetUserPermissionObject(paylod).subscribe(data => {
      if (data.length > 0) {
        console.log("PermissionObject", data);

        if (data[0].SubfunctionID == paylod.SubfunctionID) {

          if (data[0].Update_Opt != 2) {
              Swal.fire('Please Contact Administrator');
          }
          else {
            this.PurchaseCreateForm.enable();
            this.isUpdateMode = false;
            this.isUpdateMode1= true;
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

  createPurchaseInvoiceForm() {
    this.PurchaseCreateForm = this.fb.group({
      PurchaseInvoiceId: [this.PurchaseInvoiceId],
      Division: [0],
      Office: [0],
      OfficeGST: [''],
      BookingAgainst: [0],
      PINumber: [''],
      PIDate: [this.minDate],
      StatusId: [1],
      VendorId: [0],
      VendorBranch: [''],
      VendorType: [''],
      VINumber: [''],
      VIDate: [''],
      DueDate: [''],
      VendorGST: [''],
      VendorGSTCategory: [''],
      RCMApplicable: [''],
      TDSApplicability: [''],
      TDSSection: [''],
      ReasonforNonTDS: [''],
      LDCRate: [''],
      PurchaseOrder: [''],
      InternalOrder: [''],
      SubTotal: [''],
      TDSRate:[0],
      IGST: [''],
      CGST: [''],
      SGST: [''],
      InvoiceAmount: [''],
      InvoiceCurrency: [''],
      CreatedDate:[this.minDate],
      CreatedBy: localStorage.getItem('UserID'),
      TDSAmount:[0],

      // Table
      Id: [0],
      AccountId: [0],
      Rate: [''],
      Qty: [''],
      Amount: [''],
      CurrencyId: [1],
      ExRate: ['1'],
      LocalAmount: [''],
      IsTaxable: [''],
      GSTGroup: [''],
      IsDelete: [0]
    });

    let entityInfo = this.commonDataService.getLocalStorageEntityConfigurable();
    this.entityCurrencyName = entityInfo['Currency'];
    this.PurchaseCreateForm.controls['InvoiceCurrency'].setValue(this.entityCurrencyName);
  }

  getPurchaseInvoiceAdminInfo() {
    var service = `${this.globals.APIURL}/PurchaseInvoice/GetPurchaseInvoiceById`; var payload = { Id: this.PurchaseInvoiceId };
    this.dataService.post(service, payload).subscribe(async (result: any) => {
      this.PurchaseTableList = [];
      this.FileList = [];
      this.pagedItems = [];
      if (result.message == 'Success' && result.data.Table.length > 0) {
        let info = result.data.Table[0];

        this.CreatedBy = info.CreatedByName;
        this.CreatedOn = info.CreatedDate;
        this.ModifiedOn = info.UpdatedDate;
        this.ModifiedBy = info.UpdatedByName;
        if (info.StatusId == 2) this.isFinalRecord = true;

        if (info.PurchaseOrder) this.orderType = 'Purchase';
        else if (info.InternalOrder) this.orderType = 'Internal';
        else this.orderType = '';

        this.PurchaseCreateForm.patchValue({
          PurchaseInvoiceId: this.PurchaseInvoiceId,
          Division: info.Division,
          Office: info.Office,
          OfficeGST: info.OfficeGST,
          BookingAgainst: info.BookingAgainst,
          PINumber: info.PINumber,
          PIDate: this.datePipe.transform(info.PIDate, 'y-MM-dd'),
         // PIDate: info.PIDate,
          StatusId: info.StatusId,
          VendorId: info.VendorId,
          VendorBranch: info.VendorBranch,
          VendorType: info.VendorType,
          VINumber: info.VINumber,
          VIDate: this.datePipe.transform(info.VIDate, 'y-MM-dd'),
        //  VIDate: info.VIDate,
           DueDate: this.datePipe.transform(info.DueDate, 'dd-MM-y'),
          //DueDate: info.DueDate,
          VendorGST: info.VendorGST,
          VendorGSTCategory: info.VendorGSTCategory,
          RCMApplicable: info.RCMApplicable,
          TDSApplicability: info.TDSApplicability,
          TDSSection: info.TDSSection,
          ReasonforNonTDS: info.ReasonforNonTDS,
          LDCRate: info.LDCRate,
          PurchaseOrder: info.PurchaseOrder,
          InternalOrder: info.InternalOrder,
          SubTotal: info.SubTotal,
          IGST: info.IGST,
          CGST: info.CGST,
          SGST: info.SGST,
          IsDelete: info.IsDelete ? info.IsDelete : 0,
          InvoiceAmount: info.InvoiceAmount,
          InvoiceCurrency: info.InvoiceCurrency,
          CreatedBy: info.CreatedBy,
          TDSAmount:info.TDSRate
        });
        this.getOfficeList(info.Division);
        this.getVendorBranchList(info.VendorId, info.VendorBranch, false);
        const vendorDetails =  await this.getVendorDetailsInfo(info.VendorBranch)
        if (result.data.Table1.length > 0) {
          this.PurchaseTableList = result.data.Table1;
          this.setPage(1);
          this.TdsPercentageCalculation();
          if (result.data.Table2.length > 0) {
            this.FileList = result.data.Table2;
          }
        };
      }
    }, error => { });
  }

  fileSelected(event) {
    if (event.target.files.length > 0 && this.FileList.length < 5) {
      this.FileList.push({
        Id: 0,
        PurchaseInvoiceId: this.PurchaseInvoiceId,
        FileName: event.target.files[0].name,
        FilePath: event.target.files[0].name
      });
    }
    else {
      Swal.fire('A maximum of five files must be allowed.');
    }
  }

  getDivisionList() {
    var service = `${this.globals.APIURL}/Division/GetOrganizationDivisionList`; var payload: any = {};
    this.dataService.post(service, payload).subscribe((result: any) => {
      this.divisionList = [];
      if (result.data.Table.length > 0) {
        let divisionList = result.data.Table;
        this.divisionList = divisionList.filter(x => x.Active == true);
      }
    }, error => { });
  }


  getOfficeList(id: number) {
    this.commonDataService.getOfficeByDivisionId({ DivisionId: id }).subscribe(result => {
      this.officeList = [];
      if (result['data'].Table.length > 0) {
        this.officeList = result['data'].Table;
      }
    });
  }

  getStatus() {
    var service = `${this.globals.APIURL}/PurchaseInvoice/GetPurchaseInvoiceDropDownList`; var payload: any = {};
    this.dataService.post(service, payload).subscribe((result: any) => {
      this.statusList = [];
      if (result.data.Table.length > 0) {
        this.statusList = result.data.Table;
      }
    }, error => { });
  }
  
  getDueDate(event) {
   
    var service = `${this.globals.APIURL}/PurchaseInvoice/GetPurchaseInvoiceDueDate`;
    this.dataService.post(service, { VendorBranchId: event }).subscribe((result: any) => {
      this.duedatelist = [];
      if (result.message == 'Success' && result.data.Table.length > 0) {
        this.duedatelist = result.data.Table;
        this.calculateDueDate(new Date(event));
        let info = result.data.Table[0];
      
      }
    }, error => { });
  }
  
calculateDueDate(maxDate: any) {

  const creditDays = this.duedatelist.length > 0 ?  this.duedatelist[0].CreditDays : 0; 
  const selectedDate = maxDate.value as Date;                   

  const dueDate = new Date(selectedDate); 
  dueDate.setDate(dueDate.getDate() + creditDays)

  this.DueDateopen = this.datePipe.transform(dueDate, 'dd-MM-y'); 
 
}

  getVendorList() {
    return new Promise((resolve, reject) => {
      this.paymentService.getVendorList({}).pipe(takeUntil(this.ngUnsubscribe)).subscribe((result: any) => {
        if (result.message == "Success") {
          if (result["data"].Table.length) {
            this.vendorsList = result["data"].Table.filter(x => x.OnboradName == 'CONFIRMED' && x.Status == 'Active');
            resolve(true);
          }
        }
      }, (error: HttpErrorResponse) => {
        reject();
      });
    });
  }

  getReasonList() {
    this.VendorService.getTDSReason({}).subscribe((response) => {
      this.reasonList = response['data'].Table;
    });
  }

  getVendorBranchList(event, setBrach = false, branchId?: any) {
   
    this.vendorBranch = [];
    this.vendorBranch = this.vendorsList.filter(x => x.VendorID == event);

      // this.PurchaseCreateForm.value.VendorBranch = this.vendorBranch[0].BranchCode;
    if(this.vendorBranch.length  === 1 && setBrach){
      const singleBranchDetails = this.vendorBranch[0];
      // this.vendorBranchId = singleBranchDetails.VendorBranchID;
      this.getDueDate(singleBranchDetails.VendorBranchID);
      this.PurchaseCreateForm.controls['VendorBranch'].setValue(singleBranchDetails.VendorBranchID);
      this.getVendorDetailsInfo(singleBranchDetails.VendorBranchID);
    }
   
  }

  // getTDSSection() {
  //   const payLoad = { TDSRatesId: 0, TaxName: '', RatePercentage: '', sectionID: 0, SectionID: 0, SectionName: '', EffectiveDate: '', IsActive: true, Status: '', Remarks: '' };
  //   this.tdsService.getSection(payLoad).subscribe(data => {
  //     this.tdsSectionData = data['data'];
  //   });
  // }

  getTDSSection(){

    const payLoad = { TDSRatesId: 0, TaxName: '', RatePercentage: '', sectionID: 0, SectionID: 0, SectionName: '', Date: '', IsActive: true, Status: '', Remarks: '', TDSRate:0};
      this.VendorService.getVendorSectionRate(payLoad).subscribe(data => {
      this.tdsSectionData = data['data']['Table'];
    });
  }

  getTdsSection(SectionName) {
  
  const  tdsRate: any =   this.tdsSectionData.find((item) => item.SectionID == SectionName );
  this.PurchaseCreateForm.controls.TDSRate.setValue(tdsRate.Rate)
}
  getVendorDetailsInfo(event) {
  
    return new Promise((resolve, reject) => {
      let vendorInfo = this.vendorBranch.find(x => x.VendorBranchID == event);
      if (vendorInfo) {
        this.VendorService.getVendorId({ VendorID: vendorInfo.VendorID, VendorBranchID: event }).pipe().subscribe(response => {
          if (response['data'].Table1.length > 0) { this.officeCityId = response['data'].Table1[0].City; }
          if (response['data'].Table4.length > 0) {
            this.PurchaseCreateForm.controls['VendorGSTCategory'].setValue(response['data'].Table4[0].GSTCategory ? response['data'].Table4[0].GSTCategory : '');
            this.PurchaseCreateForm.controls['VendorGST'].setValue(response['data'].Table4[0].GSTNumber ? response['data'].Table4[0].GSTNumber : '');
            if (response['data'].Table4[0].GSTCategory) {
              let info = this.GSTCategoryList.find(x => x.Id == response['data'].Table4[0].GSTCategory);
              if (info.CategoryName == 'Overseas') { this.PurchaseCreateForm.controls['VendorType'].setValue('Overseas'); }
              else { this.PurchaseCreateForm.controls['VendorType'].setValue('Local'); }
            }
          }
          if (response['data'].Table5.length > 0) {
            let info = response['data'].Table5[response['data'].Table5.length - 1];
            this.vendorTDS = info.TDSRate ? info.TDSRate :  0;
           // console.log('vendorTDS', this.vendorTDS)
            this.vendorLDC = info.Rate ? info.Rate : ''
            if (info) {
              this.PurchaseCreateForm.controls['TDSApplicability'].setValue(info.TDSApplicability ? info.TDSApplicability : '');
              this.PurchaseCreateForm.controls['TDSSection'].setValue(info.TDSSectionId ? info.TDSSectionId : '');
              this.PurchaseCreateForm.controls['ReasonforNonTDS'].setValue(info.Reason ? info.Reason : '');
              this.PurchaseCreateForm.controls['LDCRate'].setValue( this.vendorLDC );
              this.PurchaseCreateForm.controls['TDSRate'].setValue(this.vendorTDS);
            }
          }
          resolve(true);
          this.TdsPercentageCalculation();
        });
      }
    })
    
  }

  OnClickDeleteValueFile(index: number) {
    this.FileList.splice(index, 1);
  }

  getOfficeGST(event) {
    let officeInfo = this.officeList.find(x => x.ID == event);
    if (officeInfo) this.PurchaseCreateForm.controls['OfficeGST'].setValue(officeInfo.GSTNo);
  }

  GetGSTCategory() {
    var service = `${this.globals.APIURL}/Customer/GetGSTCategory`; var payload: any = {};
    this.dataService.post(service, payload).subscribe((result: any) => {
      this.GSTCategoryList = [];
      if (result.data.Table.length > 0) {
        this.GSTCategoryList = result.data.Table;
      }
    }, error => { });
  }

  // getPurchaseList() {
  //   let service = `${this.globals.APIURL}/PurchaseOrder/GetPurchaseOrderList`;
  //   this.dataService.post(service, { Id: 0, PurchaseNumber: '', PurchaseDate: '', VendorId: 0, StatusId: 0 }).subscribe((result: any) => {
  //     this.purchaseList = [];
  //     if (result.message == 'Success' && result.data.Table.length > 0) {
  //       this.purchaseList = result.data.Table;
  //     }
  //   }, error => {
  //     console.error(error);
  //   });
  // }

  // getInternalOrderList() {
  //   let service = `${this.globals.APIURL}/InternalOrder/GetInternalOrderList`;
  //   this.dataService.post(service, { Id: 0, InternalNumber: '', InternalDescription: '', InternalDate: '', StatusId: 0 }).subscribe((result: any) => {
  //     this.internalOderList = [];
  //     if (result.message == 'Success' && result.data.Table.length > 0) {
  //       this.internalOderList = result.data.Table;
  //     }
  //   }, error => {
  //     console.error(error);
  //   });
  // }

   getPurchaseList() {
    let service = `${this.globals.APIURL}/PurchaseInvoice/GetPurchaseInvoiceDropDownList`;
    this.dataService.post(service, { Id: 0, PurchaseNumber: ''}).subscribe((result: any) => {
      this.purchaseList = [];
      if (result.message == 'Success' && result.data.Table1.length > 0) {
        this.purchaseList = result.data.Table1;
      }
    }, error => {
      console.error(error);
    });
  }

  getInternalOrderList() {
    let service = `${this.globals.APIURL}/PurchaseInvoice/GetPurchaseInvoiceDropDownList`;
    this.dataService.post(service, { Id: 0, InternalNumber: ''}).subscribe((result: any) => {
      this.internalOderList = [];
      if (result.message == 'Success' && result.data.Table2.length > 0) {
        this.internalOderList = result.data.Table2;
      }
    }, error => {
      console.error(error);
    });
  }

  ChartAccountList() {
    this.commonDataService.getChartaccountsFilter().subscribe(async data => {
      this.accountName = [];
      if (data["data"].length > 0) {
        this.accountName = data["data"];
      }
    });
  }

  getCurrency() {
    let service = `${this.globals.SaApi}/SystemAdminApi/GetCurrency`;
    this.dataService.post(service, {}).subscribe((result: any) => {
      this.currencyList = [];
      if (result.length > 0) {
        this.currencyList = result;
        let entityInfo = this.commonDataService.getLocalStorageEntityConfigurable();
        this.entityCurrencyName = entityInfo['Currency'];
        let info = this.currencyList.find(x => x.Currency = this.entityCurrencyName);
        this.PurchaseCreateForm.controls['InvoiceCurrency'].setValue(info.ID);
      }
    }, error => { });
  }

  addRow() {
    var validation = "";
    if (this.PurchaseCreateForm.value.AccountId == "" || this.PurchaseCreateForm.value.AccountId == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please Select Account Name.</span></br>";
    }
    if (this.PurchaseCreateForm.value.Rate == "" || this.PurchaseCreateForm.value.Rate == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please Enter Rate.</span></br>";
    }
    if (this.PurchaseCreateForm.value.Qty == "" || this.PurchaseCreateForm.value.Qty == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please Enter Qty.</span></br>";
    }
    if (this.PurchaseCreateForm.value.CurrencyId == "" || this.PurchaseCreateForm.value.CurrencyId == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please Select Currency.</span></br>";
    }
    if (this.PurchaseCreateForm.value.ExRate == "" || this.PurchaseCreateForm.value.ExRate == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please Enter ExRate.</span></br>";
    }
    if (this.PurchaseCreateForm.value.LocalAmount == "" || this.PurchaseCreateForm.value.LocalAmount == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please Enter Local Amount.</span></br>";
    }
    if (this.PurchaseCreateForm.value.IsTaxable == "") {
      validation += "<span style='color:red;'>*</span> <span>Please Select Taxable.</span></br>";
    }
    if (this.PurchaseCreateForm.value.IsTaxable == 1) {
      if (this.PurchaseCreateForm.value.GSTGroup == "" || this.PurchaseCreateForm.value.GSTGroup == 0) {
        validation += "<span style='color:red;'>*</span> <span>Please Enter GST Group.</span></br>";
      }
    }
    if (validation != "")
     { 
      Swal.fire(validation);
       return false;
       }

    let info = this.PurchaseCreateForm.value;
    let account = this.accountName.find(x => x.ChartOfAccountsId == info.AccountId);
    let currency = this.currencyList.find(x => x.ID == info.CurrencyId);

    if (this.isEditMode) {
      let editValue = {
        Id: info.Id,
        PurchaseInvoiceId: this.PurchaseInvoiceId,
        AccountId: info.AccountId,
        Rate: info.Rate,
        Qty: info.Qty,
        Amount: info.Rate * info.Qty,
        CurrencyId: info.CurrencyId,
        ExRate: info.ExRate ? info.ExRate : 1,
        LocalAmount: info.LocalAmount,
        IsTaxable: info.IsTaxable,
        GSTGroup: info.GSTGroup ? info.GSTGroup : 0,
        CurrencyName: currency.Currency,
        AccountName: account.AccountName,
        IGST: 0,
        CGST: 0,
        SGST: 0,
        InvoiceAmount: 0,
        InvoiceCurrency: 0,
        TDSRate:info.TDSRate
      };

      this.PurchaseTableList[this.editSelectedIdex] = editValue;
      this.isEditMode = !this.isEditMode;
      this.resetTable();
      this.setPage(1);
      this.calculateTotalAmount(editValue, 'edit');
      return;
    }

    this.PurchaseTableList.unshift({
      Id: info.Id,
      PurchaseInvoiceId: this.PurchaseInvoiceId,
      AccountId: info.AccountId,
      Rate: info.Rate,
      Qty: info.Qty,
      Amount: info.Rate * info.Qty,
      CurrencyId: info.CurrencyId,
      ExRate: info.ExRate ? info.ExRate : 1,
      LocalAmount: info.LocalAmount,
      IsTaxable: info.IsTaxable,
      GSTGroup: info.GSTGroup ? info.GSTGroup : 0,
      CurrencyName: currency.Currency,
      AccountName: account.AccountName,
      IGST: 0,
      CGST: 0,
      SGST: 0,
      InvoiceAmount: 0,
      InvoiceCurrency: 0,
      TDSRate:info.TDSRate
    });
    this.resetTable();
    this.setPage(1);
    this.calculateTotalAmount(this.PurchaseTableList[0], 'create');
  }

  setPage(page: number) {
    if (page < 1 || page > this.pager.totalPages) { return; }
    this.pager = this.ps.getPager(this.PurchaseTableList.length, page);
    this.pagedItems = this.PurchaseTableList.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

  resetTable() {
    this.PurchaseCreateForm.controls['Id'].setValue(0);
    this.PurchaseCreateForm.controls['AccountId'].setValue(0);
    this.PurchaseCreateForm.controls['Rate'].setValue('');
    this.PurchaseCreateForm.controls['Qty'].setValue('');
    this.PurchaseCreateForm.controls['Amount'].setValue('');
    this.PurchaseCreateForm.controls['CurrencyId'].setValue(1);
    this.PurchaseCreateForm.controls['ExRate'].setValue('1');
    this.PurchaseCreateForm.controls['LocalAmount'].setValue('');
    this.PurchaseCreateForm.controls['IsTaxable'].setValue('');
    this.PurchaseCreateForm.controls['GSTGroup'].setValue('');
  }

  OnClickRadio(index) {
    this.editSelectedIdex = index;
  }

  OnClickEditValue() {
    let info = this.PurchaseTableList[this.editSelectedIdex];
    this.PurchaseCreateForm.patchValue({
      Id: info.Id,
      PurchaseInvoiceId: this.PurchaseInvoiceId,
      AccountId: info.AccountId,
      Rate: info.Rate,
      Qty: info.Qty,
      Amount: info.Amount,
      CurrencyId: info.CurrencyId,
      ExRate: info.ExRate,
      LocalAmount: info.LocalAmount,
      IsTaxable: info.IsTaxable,
      GSTGroup: info.GSTGroup
    });
    this.isEditMode = !this.isEditMode;
  }

  OnClickDeleteValue() {
    if (this.editSelectedIdex >= 0 && this.editSelectedIdex != null) {
      this.PurchaseTableList.splice(this.editSelectedIdex, 1);
      this.editSelectedIdex = null;
      this.setPage(1);
      this.calculateTotalAmount();
    }
    else {
      Swal.fire('Please select the Item!!');
    }
  }


  async getModuleType(call) {
    return new Promise((resolve, rejects) => {
      let service = `${this.globals.APIURL}/LedgerMapping/GetLedgerDropDownList`;
      this.dataService.post(service, {}).subscribe(async(result: any) => {
        if (result.message = "Success") {
          // this.ledgerSubModuleList = [];
  
          this.modules = result.data.Module
  
          let subModule = this.modules.find(x => x.ModuleName.toUpperCase() == this.moduleName.toUpperCase());
          this.ModuleId = subModule.ID
          await  this.checkLedgerMapping()
          call()
        }
      }, error => {
        console.error(error);
      });
    })
  }


  async checkLedgerMapping() {
    return new Promise((resolve, rejects) => {
      let service = `${this.globals.APIURL}/Common/CheckModuleAccess`;
      this.dataService.post(service, { ModuleId: this.ModuleId }).subscribe(async (result: any) => {
        if (result.data == "Access Granted") {
          this.mappingSuccess = true      
        }
        else{
          this.mappingSuccess = false  
           this.errorMessage = result.data
            // Swal.fire(this.errorMessage)
            resolve(true)
        }
      }, error => {
        console.error(error);
      });
    })
  }

  async saveInfo(status: any, isDelete = false ) {

    if(this.mappingSuccess == false){
      Swal.fire(this.errorMessage)
      return false;
    }

    var validation = "";
    if (this.PurchaseCreateForm.value.Division == "" || this.PurchaseCreateForm.value.Division == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please select Division.</span></br>";
    }
    if (this.PurchaseCreateForm.value.Office == "" || this.PurchaseCreateForm.value.Office == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please select Office.</span></br>";
    }
    // if (this.PurchaseCreateForm.value.PINumber == "" || this.PurchaseCreateForm.value.PINumber == 0) {
    //   validation += "<span style='color:red;'>*</span> <span>Please enter Purchase Invoice Number#.</span></br>";
    // }
    if (this.PurchaseCreateForm.value.PIDate == "" || this.PurchaseCreateForm.value.PIDate == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please select Purchase Invoice Date.</span></br>";
    }
    if (this.PurchaseCreateForm.value.VendorId == "" || this.PurchaseCreateForm.value.VendorId == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please select Vendor.</span></br>";
    }
    if (this.PurchaseCreateForm.value.VendorBranch == "" || this.PurchaseCreateForm.value.VendorBranch == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please select Vendor Branch.</span></br>";
    }
    if (this.PurchaseCreateForm.value.VINumber == "" || this.PurchaseCreateForm.value.VINumber == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please enter Vendor Invoice #.</span></br>";
    }
    if (this.PurchaseCreateForm.value.VIDate == "" || this.PurchaseCreateForm.value.VIDate == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please enter Vendor Date.</span></br>";
    }
    if (this.PurchaseCreateForm.value.DueDate == "" || this.PurchaseCreateForm.value.DueDate == 0) {
      validation += "<span style='color:red;'>*</span> <span>Please select Due Date.</span></br>";
    }
    if(this.FileList.length == 0){
      validation += "<span style='color:red;'>*</span> <span>Please choose a File</span></br>"
    }
    if (this.orderType == 'Purchase') {
      if (this.PurchaseCreateForm.value.PurchaseOrder == "" || this.PurchaseCreateForm.value.PurchaseOrder == 0) {
        validation += "<span style='color:red;'>*</span> <span>Please select Purchase Order.</span></br>";
      }
    }
    else if (this.orderType == 'Internal') {
      if (this.PurchaseCreateForm.value.InternalOrder == "" || this.PurchaseCreateForm.value.InternalOrder == 0) {
        validation += "<span style='color:red;'>*</span> <span>Please select Internal Order.</span></br>";
      }
    }
    else if (this.orderType == '') {
      validation += "<span style='color:red;'>*</span> <span>Please select Order Type.</span></br>";
    }
    if (this.PurchaseTableList.length == 0) {
      validation += "<span style='color:red;'>*</span> <span>Attest one record must be create in the Purchase Table.</span></br>";
    }
    // if(status && !this.isFinalRecord){
    //   await this.autoCodeGeneration('purchase')
    // }
    if (validation != "") {
      if(status != 3){
      Swal.fire(validation);
      return false;
      }
    }

    
    let saveMsg = `Do you want to Save this Details?`;
    let finalMsg = `Final voucher not possible to edit <br> Do you want proceed?`;
    let closeMsg = `Voucher is not yet finalized <br> Do you want to still exit`;
    let deleteMsg = `Do you want to Delete this Details?`;
    
    let combinedText: string;

    if (status === 2) {
      combinedText = finalMsg;
    } else if (status === 1) {
      combinedText = isDelete ? deleteMsg : saveMsg;
    } else {
      combinedText = closeMsg;
    }
    
        // set Delete flag
       
    if(isDelete  && this.isUpdate){
      this.PurchaseCreateForm.controls['IsDelete'].setValue(1); 
    }

      //  Its finaled already and cancelled
      if (status == 3 && this.isFinalRecord) {
        this.ViewPage();
        return;
      }


      Swal.fire({
            showCloseButton: true,
            title: '',
            icon: 'question',
            html: combinedText,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            reverseButtons: false,
            allowOutsideClick: false
          }).then(async (result) => {
            if (result.isConfirmed) {
      
           // If canceled 
      
          if(status == 3 ){
            this.ViewPage();
            return;
          }

          if(status == 2 && !this.isFinalRecord){
            await this.autoCodeGeneration('purchase')
          }

          await this.createPayload(status);

        let service = `${this.globals.APIURL}/PurchaseInvoice/SavePurchaseInvoiceInfo`;
        this.dataService.post(service, this.payload).subscribe((result: any) => {
          if (result.message == "Success") {
  
            Swal.fire(result.data.Message, '', 'success');
            this.isUpdateMode = true;
            this.isUpdateMode1 = true;

            if(status == 0){
              this.PurchaseInvoiceId = result.data.Id;
                this.isUpdateMode = true;
                this.isUpdateMode1 = true;
            }
          
            if (this.isUpdate && status && !this.isFinalRecord) {
       
               this.updateAutoGenerated();
               }

               if(isDelete && this.isUpdate){
                this.ViewPage();
              }
  
               if (!this.isUpdate && !this.isFinalRecord) {
                  const PurchaseInvoiceId = result.data.Id;
                  this.editpurchaseinvoice(PurchaseInvoiceId)
                } 
          }
          if(status == 2){
           this.ViewPage(); 
            return;          
          }

        }, error => {
          console.error(error);
        });
      }
    });
  }
  editpurchaseinvoice(id: number) {
    this.router.navigate(['/views/purchase-admin-info/purchase-invoice-info', { id: id, isUpdate: true }]);
  }
  
  ViewPage(){
    this.router.navigate(['/views/purchase-invoice/purchase-invoice-view']);
  }

  goBack(){
    // If finaled allow to rediret to list page
    if(this.isFinalRecord){
       this.ViewPage();
      return
    }

    // confirm user before redirect to list page
    Swal.fire({
      showCloseButton: true,
      title: '',
      icon: 'question',
      html:`Voucher is not yet finalized <br> Do you want to still exit?`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: false,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
         this.ViewPage();
      }
    })
  }
  
  updateAutoGenerated() {
    let Info = this.autoGenerateCodeList.filter(x => x.ObjectName == 'Purchase Invoice(Admin)');
    if (Info.length > 0) {
      Info[0].NextNumber = Info[0].NextNumber + 1;
      let service = `${this.globals.APIURL}/COAType/UpdateAutoGenerateCOdeNextNumber`;
      this.dataService.post(service, { NumberRangeObject: { Table: [{ Id: Info[0].Id, NextNumber: Info[0].NextNumber }] } }).subscribe((result: any) => {
      }, error => {
        console.error(error);
      });
    }
  }

  createPayload(status) {

    // if(this.vendorBranch.length == 1)
    // {
    //   this.PurchaseCreateForm.value.VendorBranch = this.newOne;
    // }
    let info = this.PurchaseCreateForm.value;
     let Table = {
      PurchaseInvoiceId: this.PurchaseInvoiceId,
      Division: info.Division,
      Office: info.Office,
      OfficeGST: info.OfficeGST,
      BookingAgainst: info.BookingAgainst,
      PINumber: info.PINumber,
      PIDate: info.PIDate,
      StatusId: status,
      VendorId: info.VendorId,
      VendorBranch: info.VendorBranch,
      VendorType: info.VendorType,
      VINumber: info.VINumber,
      VIDate: info.VIDate,
      DueDate: info.DueDate,
      VendorGST: info.VendorGST,
      VendorGSTCategory: info.VendorGSTCategory ? info.VendorGSTCategory : '',
      RCMApplicable: info.RCMApplicable ? info.RCMApplicable : '',
      TDSApplicability: info.TDSApplicability ? info.TDSApplicability : '',
      TDSSection: info.TDSSection ? info.TDSSection : '',
      ReasonforNonTDS: info.ReasonforNonTDS ? info.ReasonforNonTDS : '',
      LDCRate: Number(info.LDCRate),
      PurchaseOrder: info.PurchaseOrder,
      InternalOrder: info.InternalOrder,
      IsDelete: info.IsDelete,
      SubTotal: info.SubTotal,
      IGST: Math.trunc(info.IGST),
      CGST: Math.trunc(info.CGST),
      SGST: Math.trunc(info.SGST),
      InvoiceAmount: Math.trunc(info.InvoiceAmount),
      InvoiceCurrency: info.InvoiceCurrency ? info.InvoiceCurrency : 0,
      CreatedBy: info.CreatedBy,
      TDSAmount:info.TDSRate
    };
    let purchaseTableList = this.PurchaseTableList;
    purchaseTableList.forEach(element => {
      delete element.AccountName; delete element.CurrencyName; delete element.TDSRate;
    });
    this.payload = {
      "PurchaseInvoice": {
        "Table": [Table],
        "Table 1": purchaseTableList,
        "Table 2": this.FileList
      }
    };
  }

  getNumberRange() {
    let service = `${this.globals.APIURL}/COAType/GetNumberRangeCodeGenerator`;
    this.dataService.post(service, { Id: 0, ObjectId: 0 }).subscribe((result: any) => {
      if (result.message = "Success") {
        this.autoGenerateCodeList = [];
        if (result.data.Table.length > 0) {
          for (let data of result.data.Table) {
            data.EffectiveDate = this.datePipe.transform(data.EffectiveDate, 'YYYY-MM-dd');
          }
          this.autoGenerateCodeList = result.data.Table;
          // await this.autoCodeGeneration('purchase')
        }
      }
    }, error => {
      console.error(error);
    });
  }

  async autoCodeGeneration(event: any) {
    return new Promise(async (resolve, rejects) => {
    // if (this.isUpdate && !this.isFinalRecord ) {
      if (event && this.isUpdate && !this.isFinalRecord) {
        let Info = this.autoGenerateCodeList.filter(x => x.ObjectName == 'Purchase Invoice(Admin)');
        if (Info.length > 0) {
          let sectionOrderInfo = await this.checkAutoSectionItem([{ sectionA: Info[0].SectionA }, { sectionB: Info[0].SectionB }, { sectionC: Info[0].SectionC }, { sectionD: Info[0].SectionD }], Info[0].NextNumber, event);
          let code = this.autoCodeService.NumberRange(Info[0], sectionOrderInfo.sectionA, sectionOrderInfo.sectionB, sectionOrderInfo.sectionC, sectionOrderInfo.sectionD);
          if (code) this.PurchaseCreateForm.controls['PINumber'].setValue(code.trim().toUpperCase());
          resolve(true);
        }
        else {
          Swal.fire('Please create the auto-generation code for Purchase Invoice.');
          resolve(true);
        }
      }
      else {
        this.PurchaseCreateForm.controls['PINumber'].setValue('');
        resolve(true);
      }
    // }
  })
}

  checkAutoSectionItem(sectionInfo: any, runningNumber: any, Code: string) {
    var sectionA = '';
    var sectionB = '';
    var sectionC = '';
    var sectionD = '';
    var officeInfo: any = {};
    var divisionInfo: any = {};

    if (this.PurchaseCreateForm.value.Division && this.PurchaseCreateForm.value.Office) {
      officeInfo = this.officeList.find(x => x.ID == this.PurchaseCreateForm.value.Office);
      divisionInfo = this.divisionList.find(x => x.ID == this.PurchaseCreateForm.value.Division);
    }

    for (var i = 0; i < sectionInfo.length; i++) {
      var condition = i == 0 ? sectionInfo[i].sectionA : i == 1 ? sectionInfo[i].sectionB : i == 2 ? sectionInfo[i].sectionC : i == 3 ? sectionInfo[i].sectionD : sectionInfo[i].sectionD;
      switch (condition) {
        case 'Office Code (3 Chars)': i == 0 ? sectionA = officeInfo.OfficeName ? officeInfo.OfficeName : '' : i == 1 ? sectionB = officeInfo.OfficeName ? officeInfo.OfficeName : '' : i == 2 ? sectionC = officeInfo.OfficeName ? officeInfo.OfficeName : '' : i == 3 ? sectionD = officeInfo.OfficeName : ''; break;
        case 'Running Number (3 Chars)': i == 0 ? sectionA = runningNumber : i == 1 ? sectionB = runningNumber : i == 2 ? sectionC = runningNumber : i == 3 ? sectionD = runningNumber : ''; break;
        case 'Running Number (4 Chars)': i == 0 ? sectionA = runningNumber : i == 1 ? sectionB = runningNumber : i == 2 ? sectionC = runningNumber : i == 3 ? sectionD = runningNumber : ''; break;
        case 'Running Number (5 Chars)': i == 0 ? sectionA = runningNumber : i == 1 ? sectionB = runningNumber : i == 2 ? sectionC = runningNumber : i == 3 ? sectionD = runningNumber : ''; break;
        case 'Running Number (6 Chars)': i == 0 ? sectionA = runningNumber : i == 1 ? sectionB = runningNumber : i == 2 ? sectionC = runningNumber : i == 3 ? sectionD = runningNumber : ''; break;
        case 'Running Number (7 Chars)': i == 0 ? sectionA = runningNumber : i == 1 ? sectionB = runningNumber : i == 2 ? sectionC = runningNumber : i == 3 ? sectionD = runningNumber : ''; break;
        case 'Office Code (4 Chars)': i == 0 ? sectionA = officeInfo.OfficeName ? officeInfo.OfficeName : '' : i == 1 ? sectionB = officeInfo.OfficeName ? officeInfo.OfficeName : '' : i == 2 ? sectionC = officeInfo.OfficeName ? officeInfo.OfficeName : '' : i == 3 ? sectionD = officeInfo.OfficeName : ''; break;
        case 'Division Code (4 Chars)': i == 0 ? sectionA = divisionInfo.DivisionName ? divisionInfo.DivisionName : '' : i == 1 ? sectionB = divisionInfo.DivisionName ? divisionInfo.DivisionName : '' : i == 2 ? sectionC = divisionInfo.DivisionName ? divisionInfo.DivisionName : '' : i == 3 ? sectionD = divisionInfo.DivisionName ? divisionInfo.DivisionName : '' : ''; break;
        case 'Division Code (3 Chars)': i == 0 ? sectionA = divisionInfo.DivisionName ? divisionInfo.DivisionName : '' : i == 1 ? sectionB = divisionInfo.DivisionName ? divisionInfo.DivisionName : '' : i == 2 ? sectionC = divisionInfo.DivisionName ? divisionInfo.DivisionName : '' : i == 3 ? sectionD = divisionInfo.DivisionName ? divisionInfo.DivisionName : '' : ''; break;
        case 'FY (4 Char e.g. 2023)': i == 0 ? sectionA = '' : i == 1 ? sectionB = '' : i == 2 ? sectionC = '' : i == 3 ? sectionD = '' : ''; break;
        case 'FY (5 Char e.g. 22-23)': i == 0 ? sectionA = '' : i == 1 ? sectionB = '' : i == 2 ? sectionC = '' : i == 3 ? sectionD = '' : ''; break;
        case 'FY (6 Char e.g. FY2023)': i == 0 ? sectionA = '' : i == 1 ? sectionB = '' : i == 2 ? sectionC = '' : i == 3 ? sectionD = '' : ''; break;
        case 'FY (7 Char e.g. FY22-23)': i == 0 ? sectionA = '' : i == 1 ? sectionB = '' : i == 2 ? sectionC = '' : i == 3 ? sectionD = '' : ''; break;
        case 'POD Port Code (3 Char)': i == 0 ? sectionA = '' : i == 1 ? sectionB = '' : i == 2 ? sectionC = '' : i == 3 ? sectionD = '' : ''; break;
        case 'POFD Port Code (3 Char)': i == 0 ? sectionA = '' : i == 1 ? sectionB = '' : i == 2 ? sectionC = '' : i == 3 ? sectionD = '' : ''; break;
        default: break;
      }
    }
    return { sectionA: sectionA, sectionB: sectionB, sectionC: sectionC, sectionD: sectionD };
  }

  changeCurrencyEvent(currencyId: any) {
    let entityInfo = this.commonDataService.getLocalStorageEntityConfigurable();
    let info = this.currencyList.find(x => x.Currency == entityInfo['Currency']);
    this.entityCurrencyID = info.ID;
    if (this.entityCurrencyID == currencyId ) {
      this.PurchaseCreateForm.controls['ExRate'].setValue(1);
      this.PurchaseCreateForm.controls['LocalAmount'].setValue(1 * this.PurchaseCreateForm.value.Rate * this.PurchaseCreateForm.value.Qty);
      this.PurchaseCreateForm.get('ExRate').disable();
    }
    else {
      this.PurchaseCreateForm.get('ExRate').enable();
    }
  }

  exchangeRateChangeEvent(event) {
    this.PurchaseCreateForm.controls['LocalAmount'].setValue(event * this.PurchaseCreateForm.value.Rate * this.PurchaseCreateForm.value.Qty);
  }

  rateQuantityChangeEvent(event) {
    this.PurchaseCreateForm.controls['LocalAmount'].setValue((this.PurchaseCreateForm.value.Rate ? this.PurchaseCreateForm.value.Rate : 1)
      * (this.PurchaseCreateForm.value.Qty ? this.PurchaseCreateForm.value.Qty : 1) * (this.PurchaseCreateForm.value.ExRate ? this.PurchaseCreateForm.value.ExRate : 1));
  }

  taxableChangeEvent(event) {
    if (event == 0) {
      this.PurchaseCreateForm.controls['GSTGroup'].setValue('0');
      this.PurchaseCreateForm.get('GSTGroup').disable();
    }
    else {
      this.PurchaseCreateForm.get('GSTGroup').enable();
    }
  }

  getTaxGroup() {
    let service = `${this.globals.APIURL}/TaxGroup/GetTaxGroupList`;
    this.dataService.post(service, { Taxgroup: '', Rate: null, Status: '1' }).subscribe((result: any) => {
      this.taxList = [];
      if (result.message = 'Success' && result.data.Table.length > 0) {
        this.taxList = result.data.Table.filter(x => x.Active == "Active");
      }
    }, error => { });
  }

  // calculateTotalAmount(purchaseInfoTableValue?: any, methodType?: any) {
  //   var subTotalAmount = 0;
  //   if (this.PurchaseTableList.length > 0) {
  //     this.PurchaseTableList.forEach(element => { subTotalAmount += element.LocalAmount; });
  //     this.PurchaseCreateForm.controls['SubTotal'].setValue(subTotalAmount);
  //   } else { this.PurchaseCreateForm.controls['SubTotal'].setValue(''); }

  //   if (purchaseInfoTableValue.IsTaxable) {
  //     let officeInfo = this.officeList.find(x => x.ID == this.PurchaseCreateForm.value.Office);
  //     if (this.officeCityId == officeInfo.StateId ? officeInfo.StateId : 0) {
  //       let info = subTotalAmount * (purchaseInfoTableValue.GSTGroup / 100);
  //       purchaseInfoTableValue.CGST = Math.trunc(info / 2);
  //       purchaseInfoTableValue.SGST = Math.trunc(info / 2);
  //       purchaseInfoTableValue.IGST = 0;
  //     }
  //     else {
  //       let info = subTotalAmount * (purchaseInfoTableValue.GSTGroup / 100);
  //       purchaseInfoTableValue.CGST = 0;
  //       purchaseInfoTableValue.SGST = 0;
  //       purchaseInfoTableValue.IGST = Math.trunc(info / 2);
  //     }
  //     this.PurchaseTableList[methodType == 'create' ? 0 : this.editSelectedIdex] = purchaseInfoTableValue;
  //   }
  //   this.editSelectedIdex = null;

  //   var CGST = 0;
  //   var SGST = 0;
  //   var IGST = 0;

  //   this.PurchaseTableList.forEach(element => {
  //     CGST += element.CGST ? element.CGST : 0;
  //     SGST += element.SGST ? element.SGST : 0;
  //     IGST += element.IGST ? element.IGST : 0;
  //   });

  //   this.PurchaseCreateForm.controls['CGST'].setValue(CGST);
  //   this.PurchaseCreateForm.controls['SGST'].setValue(SGST);
  //   this.PurchaseCreateForm.controls['IGST'].setValue(IGST);
  //   this.PurchaseCreateForm.controls['InvoiceAmount'].setValue(CGST + SGST + IGST + subTotalAmount);
  // }



TdsPercentageCalculation(){

  var subTotalAmount = 0;
  if (this.PurchaseTableList.length > 0) {
    this.PurchaseTableList.forEach(element => {
      subTotalAmount += element.LocalAmount;
    });
    this.PurchaseCreateForm.controls['SubTotal'].setValue(subTotalAmount);  // Handle the case when subTotalAmount is 0.
   

    if (subTotalAmount > 0 && this.vendorTDS > 0) {   // Calculate Section based TDS rate on TDS amount and set the value for TDSRate 
      const tdsRate = (subTotalAmount /100 ) * this.vendorTDS ;
      this.PurchaseCreateForm.controls['TDSRate'].setValue(tdsRate);
    } else if(subTotalAmount > 0 && this.vendorLDC > '') {   // Calculate LDC based TDS rate based on TDS amount and set the value for TDSRate    
      const tdsRate = (subTotalAmount /100 ) * this.vendorLDC ;
      this.PurchaseCreateForm.controls['TDSRate'].setValue(tdsRate);
    }else{
      this.PurchaseCreateForm.controls['TDSRate'].setValue(0); 
    }
  } else {
    this.PurchaseCreateForm.controls['SubTotal'].setValue('');
  }

  return subTotalAmount

}

  calculateTotalAmount(purchaseInfoTableValue?: any, methodType?: any) {
    // var subTotalAmount = 0;
    // if (this.PurchaseTableList.length > 0) {
    //   this.PurchaseTableList.forEach(element => {
    //     subTotalAmount += element.LocalAmount;
    //   });
    //   this.PurchaseCreateForm.controls['SubTotal'].setValue(subTotalAmount);  // Handle the case when subTotalAmount is 0.
    //   this.PurchaseCreateForm.controls['TDSRate'].setValue(0);

    //   if (subTotalAmount > 0 && this.vendorTDS > 0) {   // Calculate Section based TDS rate on TDS amount and set the value for TDSRate 
    //     const tdsRate = (subTotalAmount /100 ) * this.vendorTDS ;
    //     this.PurchaseCreateForm.controls['TDSRate'].setValue(tdsRate);
    //   } else if(subTotalAmount > 0 && this.vendorLDC > '') {   // Calculate LDC based TDS rate based on TDS amount and set the value for TDSRate    
    //     const tdsRate = (subTotalAmount /100 ) * this.vendorLDC ;
    //     this.PurchaseCreateForm.controls['TDSRate'].setValue(tdsRate);
    //   }else{
    //     this.PurchaseCreateForm.controls['TDSRate'].setValue(0); 
    //   }
    // } else {
    //   this.PurchaseCreateForm.controls['SubTotal'].setValue('');
    // }

    var subTotalAmount = this.TdsPercentageCalculation();
    if (purchaseInfoTableValue && purchaseInfoTableValue.IsTaxable) {
      let officeInfo = this.officeList.find(x => x.ID == this.PurchaseCreateForm.value.Office);
      if (this.officeCityId == officeInfo.StateId ? officeInfo.StateId : 0) {
        let info = subTotalAmount * (purchaseInfoTableValue.GSTGroup / 100);
        purchaseInfoTableValue.CGST = Math.trunc(info / 2);
        purchaseInfoTableValue.SGST = Math.trunc(info / 2);
        purchaseInfoTableValue.IGST = 0;
      }
      else {
        let info = subTotalAmount * (purchaseInfoTableValue.GSTGroup / 100);
        purchaseInfoTableValue.CGST = 0;
        purchaseInfoTableValue.SGST = 0;
        purchaseInfoTableValue.IGST = Math.trunc(info / 2);
      }
      this.PurchaseTableList[methodType == 'create' ? 0 : this.editSelectedIdex] = purchaseInfoTableValue;
    }
    this.editSelectedIdex = null;

    var CGST = 0;
    var SGST = 0;
    var IGST = 0;

    this.PurchaseTableList.forEach(element => {
      CGST += element.CGST ? element.CGST : 0;
      SGST += element.SGST ? element.SGST : 0;
      IGST += element.IGST ? element.IGST : 0;
    });

      // Calculate TDS amount based on TDS rate and update the form controls
      if(this.vendorTDS >0){
        const tdsRate = (subTotalAmount /100 ) * this.vendorTDS ;
        this.PurchaseCreateForm.controls['TDSRate'].setValue(tdsRate);
      }else{
        const tdsRate = (subTotalAmount/100)* this.vendorLDC
        this.PurchaseCreateForm.controls['TDSRate'].setValue(tdsRate);
      }   


    this.PurchaseCreateForm.controls['CGST'].setValue(CGST);
    this.PurchaseCreateForm.controls['SGST'].setValue(SGST);
    this.PurchaseCreateForm.controls['IGST'].setValue(IGST);
    this.PurchaseCreateForm.controls['InvoiceAmount'].setValue(CGST + SGST + IGST + subTotalAmount);
  }

  purchaseOrderChangeEvent(type: string) { }

  orderChangeEvent() {
    this.orderType == 'Purchase' ? this.PurchaseCreateForm.controls['PurchaseOrder'].setValue('') : this.orderType == 'Internal' ? this.PurchaseCreateForm.controls['InternalOrder'].setValue('') : '';
  }

}
