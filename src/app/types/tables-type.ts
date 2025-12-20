import { TemplateRef } from "@angular/core";


 export interface TableColumn<T> {
   key: keyof T;
   label: string;
   sortable?: boolean;
   hasMenu?: boolean;
   customCellTpl?: TemplateRef<any>;
   exportable?: boolean;
   excelFormatter?: (value: any, row: T) => string;
   serverFilter?: boolean; // Enable server-side filtering for this column
   filterOptions?: FilterOptions[]; // Predefined filter options for server-side filtering
 }

 export interface FilterOptions {
   value: any;
   label: string;
 }

 export interface FilterState {
   columns: Partial<Record<string, any>>;
 }

