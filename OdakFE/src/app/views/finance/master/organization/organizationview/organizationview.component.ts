import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MastersService } from 'src/app/services/masters.service';
import { PaginationService } from 'src/app/pagination.service';
import { Image_List } from 'src/app/model/bankaccount';
import { Country, CountrySearch, Organizationlist } from 'src/app/model/Organzation';

@Component({
  selector: 'app-organizationview',
  templateUrl: './organizationview.component.html',
  styleUrls: ['./organizationview.component.css']
})
export class OrganizationviewComponent implements OnInit {

  /*Variable */
  title = 'Organization List';
  searchForm: FormGroup;
  CountryLook :CountrySearch;
  AccTypecountry:Country[];

 allItems: Organizationlist[]=[];// array of all items to be paged  
  pager: any = {};// pager object  
  pagedItems: any[];// paged items
  searchData : Organizationlist= new Organizationlist();
  statusvalues: Status[] = [
    { value: 1, viewValue: 'ACTIVE' },
    { value: 0, viewValue: 'IN-ACTIVE' },
  ];
  
  getoraganzationList: any;
  isShow: boolean=false;
  imagenotfound: any = new Image_List().Not_Found_for_List;

  constructor(private fb: FormBuilder,public ps: PaginationService, private ms: MastersService, private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.OnBindDropdownAccType();
    //this.clearSearch();
    this.createForm();
    this. PageLoadingorganizationList();
    
    
  }

  OnBindDropdownAccType() {

  }

  createForm() {
    this.searchForm = this.fb.group({
      ID: 0,
      BranchCode: "",
      BranchName: "",
      State: "",
      GSTNo: '',
      Status: 0
    });
  }

  clearSearch() {
    this.createForm();
    this.onSubmit();
  }

  onSubmit() {
    this.searchData.CompanyIncorporationNo="";
    this.searchData.OrganizationName = "";
    this.searchData.OfficeName=this.searchForm.value.BranchName;
    this.searchData.OfficeCode=this.searchForm.value.BranchCode;
    this.searchData.StateName=this.searchForm.value.State;
    this.searchData.GSTNo="";
    this.searchData.IsActive=1;
    if(this.searchForm.value.State){this.searchData.StateName=this.searchForm.value.State;}
    if(this.searchForm.value.GSTNo){this.searchData.GSTNo=this.searchForm.value.GSTNo;}
    if(this.searchForm.value.Status){this.searchData.IsActive=Number(this.searchForm.value.Status);}
    console.log( this.searchData.CompanyIncorporationNo);
    this.allItems =[];
    this.ms.getOrganizationFilter(this.searchData).subscribe(Organizationlist => {
      // set items to json response
      
      this.allItems = Organizationlist['data'].Table;

      // initialize to page 1
    this.setPage(1);

  });
    
  }
  
  

  PageLoadingorganizationList() {

    this.ms.getoraganzationList(this.searchForm.value).subscribe(data => {
      console.log( data['data'].Table)
      //data['data'].Table[6].Active=false;
        this.allItems = data['data'].Table;
        this.setPage(1);
       console.log(this.getoraganzationList);
    });

 console.log();

}

setPage(page: number) {
  //if (page < 1 || page > this.pager.totalPages) {
  //    return;
  //}
  this.pager = this.ps.getPager(this.allItems.length, page);
  this.pagedItems = this.allItems.slice(this.pager.startIndex, this.pager.endIndex + 1);
  console.log(this. allItems);
}

isDesc: boolean = false;
column: string = '';
sort(property) {
    this.isDesc = !this.isDesc; //change the direction    
    this.column = property;
    let direction = this.isDesc ? 1 : -1;

    this.pagedItems.sort(function (a, b) {
        if (a[property] < b[property]) {
            return -1 * direction;
        }
        else if (a[property] > b[property]) {
            return 1 * direction;
        }
        else {
            return 0;
        }
    });
};

}
interface Status {
  value: Number;
  viewValue: string;
}