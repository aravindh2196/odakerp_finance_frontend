import { Injectable } from '@angular/core';

@Injectable()

export class Globals {

    // UAT
    APIURL: string = 'https://odakfnuat.odaksolutions.in/api';
    MASTER_API_URL: string = 'https://odakfnuat.odaksolutions.in/api';
    SaApi: string = "https://odaksauat.odaksolutions.in/api";
    APIURLFF: string = 'https://odaksauat.odaksolutions.in/ffddev/api';
    APIURLLA: string = 'https://odaklauat.odaksolutions.in/api';

    // QA
    // APIURL: string = 'https://odakfnqa.odaksolutions.in/api';
    // MASTER_API_URL: string = 'https://odakfnqa.odaksolutions.in/api';
    // SaApi: string = "https://odaksaqa.odaksolutions.in/api";
    // APIURLFF: string = 'https://odaksaqa.odaksolutions.in/ffddev/api';
    // APIURLLA: string = 'https://odaklaqa.odaksolutions.in/api';

    // dev
    // APIURL: string = 'https://localhost:44301/api';
    // // APIURL: string = 'https://odakfn.odaksolutions.in/api';
    // MASTER_API_URL: string = 'https://odakfn.odaksolutions.in/api';
    // SaApi: string = "https://odaksaqa.odaksolutions.in/api";
    // APIURLFF: string = 'https://odaksaqa.odaksolutions.in/ffddev/api';
    // APIURLLA: string = 'https://odaklaqa.odaksolutions.in/api';
}
