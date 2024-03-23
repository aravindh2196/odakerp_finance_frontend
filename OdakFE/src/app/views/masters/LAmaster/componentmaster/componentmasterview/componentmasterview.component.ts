import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ComponentMaster, GeneralMaster } from '../../../../../model/common';
import { PaginationService } from '../../../../../pagination.service';
import { MastersService } from '../../../../../services/masters.service';
declare let $: any;

@Component({
  selector: 'app-componentmasterview',
  templateUrl: './componentmasterview.component.html',
  styleUrls: ['./componentmasterview.component.css']
})
export class ComponentmasterviewComponent implements OnInit {
    statusvalues: Status[] = [
        { value: '1', viewValue: 'ACTIVE' },
        { value: '2', viewValue: 'IN-ACTIVE' },
    ];

    constructor(private ms: MastersService, private fb: FormBuilder, public ps: PaginationService) { }

    // array of all items to be paged
    private allItems: any[];

    // pager object
    pager: any = {};

    // paged items
    pagedItems: any[];


    dataSource: ComponentMaster[];
    searchForm: FormGroup;
    dsassemblyItem: GeneralMaster[];

    ngOnInit() {
        $('.my-select').select2();
        $(document).on('select2:open', (e) => {
            const selectId = e.target.id

            $(".select2-search__field[aria-controls='select2-" + selectId + "-results']").each(function (
                key,
                value,
            ) {
                value.focus();
            })
        })
        this.createForm();
        this.refreshDepList();
        this.OnBindDropdownAssembly();
    }

    refreshDepList() {
        this.ms.getComponentList(this.searchForm.value).subscribe(data => {
            // set items to json response
            this.allItems = data;

            // initialize to page 1
            this.setPage(1);
        });
    }

    createForm() {
        this.searchForm = this.fb.group({
            ID: 0,
            ComponentCode: '',
            ComponentDescription: '',
            Status: 0
        });
    }

    OnBindDropdownAssembly() {
        this.ms.getAssemblyBind(this.searchForm.value).subscribe(data => {
            this.dsassemblyItem = data;
        });
    }

    clearSearch() {
        this.createForm();

        this.refreshDepList();
    }

    onSubmit() {
        this.refreshDepList();
    }


    setPage(page: number) {
        //if (page < 1 || page > this.pager.totalPages) {
        //    return;
        //}

        // get pager object from service
        this.pager = this.ps.getPager(this.allItems.length, page);

        // get current page of items
        this.pagedItems = this.allItems.slice(this.pager.startIndex, this.pager.endIndex + 1);
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
    value: string;
    viewValue: string;
}

