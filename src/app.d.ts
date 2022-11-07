// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { Table } from "sveltestrap";

// and what to do when importing types
declare namespace App {}

declare interface Table{
    records: any[]; // We don't know the data in table at this point
    cols: Array<string>;
    query: string;
}

declare interface SQLException{
    code: string;
    sqlMessage: string;
}

declare interface db_overview_form{
    db: string;
    tables: Array<Table>;
    records: Array<any>;
    cols: Array<any>;
    selected: string;
    query: string;
    type: string;
    success: boolean;
    error: string;
    error_message: string; 
}

declare interface db_overview_load{
    db: string;
    tables: Array<Table>; 
}

declare interface db_version_info{
    user: string;
    pass: string;
    ip: string;
    type: string;
    version: string;
}
declare interface Information{
    success: boolean;
    version: string;
    os: string;
    db: db_version_info;
    databases: Array<string>
}