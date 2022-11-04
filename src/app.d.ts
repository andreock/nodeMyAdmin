// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {}

declare interface Table{
    records: any[]; // We don't know the data in table at this point
    cols: Array<string>;
    query: string;
}